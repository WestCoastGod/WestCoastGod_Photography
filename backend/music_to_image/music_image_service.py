import os
import joblib
import torch
import numpy as np
import pandas as pd
import librosa
import base64
import io
from PIL import Image
from fastapi import UploadFile
from .model_architecture import EmotionConditionedUNet

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MUSIC_MODEL_PATH = os.path.join(BASE_DIR, "models", "music_model_optimized.joblib")
DIFFUSION_MODEL_PATH = os.path.join(BASE_DIR, "models", "diffusion_epoch1650.pth")

# --- Audio Feature Extraction ---

def extract_audio_features(music_file_path):
    """Extract audio features from music file."""
    y, sr = librosa.load(music_file_path, sr=None)

    # Extract features
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr)
    spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y=y)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    rms = librosa.feature.rms(y=y)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    tonnetz = librosa.feature.tonnetz(y=y, sr=sr)
    chroma_cqt = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_cens = librosa.feature.chroma_cens(y=y, sr=sr)

    def aggregate(feature_matrix):
        return np.concatenate(
            [np.mean(feature_matrix, axis=1), np.std(feature_matrix, axis=1)]
        )

    features = np.concatenate(
        [
            aggregate(mfccs),
            aggregate(chroma_stft),
            aggregate(spectral_contrast),
            aggregate(zero_crossing_rate),
            aggregate(np.array([tempo]).reshape(-1, 1)),
            aggregate(rms),
            aggregate(spectral_centroid),
            aggregate(spectral_bandwidth),
            aggregate(spectral_rolloff),
            aggregate(tonnetz),
            aggregate(chroma_cqt),
            aggregate(chroma_cens),
        ]
    )

    return features

def predict_music_emotion(audio_path):
    """Predict valence and arousal from audio file."""
    if not os.path.exists(MUSIC_MODEL_PATH):
        raise FileNotFoundError(f"Music model not found at: {MUSIC_MODEL_PATH}")
    
    trained_model = joblib.load(MUSIC_MODEL_PATH)
    features = extract_audio_features(audio_path)

    columns = []
    for i in range(13):
        columns.append(f"mfcc_dct{i}_mean")
        columns.append(f"mfcc_dct{i}_std")
    for i in range(12):
        columns.append(f"chroma_stft_chord{i}_mean")
        columns.append(f"chroma_stft_chord{i}_std")
    for i in range(7):
        columns.append(f"spectral_contrast_frequency{i}_mean")
        columns.append(f"spectral_contrast_frequency{i}_std")
    for i in range(1):
        columns.append(f"zero_crossing_rate_frame{i}_mean")
        columns.append(f"zero_crossing_rate_frame{i}_std")
    columns.append("tempo_mean")
    columns.append("tempo_std")
    columns.append("rms_mean")
    columns.append("rms_std")
    columns.append("spectral_centroid_mean")
    columns.append("spectral_centroid_std")
    columns.append("spectral_bandwidth_mean")
    columns.append("spectral_bandwidth_std")
    columns.append("spectral_rolloff_mean")
    columns.append("spectral_rolloff_std")
    for i in range(6):
        columns.append(f"tonnetz_dim{i}_mean")
        columns.append(f"tonnetz_dim{i}_std")
    for i in range(12):
        columns.append(f"chroma_cqt_chord{i}_mean")
        columns.append(f"chroma_cqt_chord{i}_std")
    for i in range(12):
        columns.append(f"chroma_cens_chord{i}_mean")
        columns.append(f"chroma_cens_chord{i}_std")

    features_reshaped = features.reshape(1, -1)
    features_df = pd.DataFrame(features_reshaped, columns=columns)
    predicted_va = trained_model.predict(features_df)
    valence = float(predicted_va[0][0])
    arousal = float(predicted_va[0][1])
    
    return valence, arousal

# --- Diffusion Generation ---

def cosine_beta_schedule(timesteps, s=0.008):
    steps = timesteps + 1
    x = torch.linspace(0, timesteps, steps)
    alphas_cumprod = torch.cos(((x / timesteps) + s) / (1 + s) * torch.pi * 0.5) ** 2
    alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
    betas = 1 - (alphas_cumprod[1:] / alphas_cumprod[:-1])
    return torch.clip(betas, 0.001, 0.02)

def get_noise_schedule(timesteps=1000):
    betas = cosine_beta_schedule(timesteps)
    alphas = 1. - betas
    alphas_cumprod = torch.cumprod(alphas, dim=0)
    sqrt_alphas_cumprod = torch.sqrt(alphas_cumprod)
    sqrt_one_minus_alphas_cumprod = torch.sqrt(1. - alphas_cumprod)
    
    return {
        'betas': betas,
        'sqrt_alphas_cumprod': sqrt_alphas_cumprod,
        'sqrt_one_minus_alphas_cumprod': sqrt_one_minus_alphas_cumprod,
    }

@torch.no_grad()
def p_sample(model, x, t, t_index, v, a, schedule, device, guidance_scale=3.0):
    betas_t = schedule['betas'][t][:, None, None, None]
    sqrt_one_minus_alphas_cumprod_t = schedule['sqrt_one_minus_alphas_cumprod'][t][:, None, None, None]
    sqrt_recip_alphas_t = torch.sqrt(1.0 / (1. - betas_t))
    
    if guidance_scale != 1.0:
        noise_cond = model(x, t, v, a)
        noise_uncond = model(x, t, torch.zeros_like(v), torch.zeros_like(a))
        predicted_noise = noise_uncond + guidance_scale * (noise_cond - noise_uncond)
    else:
        predicted_noise = model(x, t, v, a)
    
    model_mean = sqrt_recip_alphas_t * (x - betas_t * predicted_noise / sqrt_one_minus_alphas_cumprod_t)
    
    if t_index == 0:
        return model_mean
    else:
        noise = torch.randn_like(x)
        return model_mean + torch.sqrt(betas_t) * noise

def generate_image(v, a, guidance_scale=5.0, timesteps=1000, seed=None):
    if not os.path.exists(DIFFUSION_MODEL_PATH):
        raise FileNotFoundError(f"Diffusion model not found at: {DIFFUSION_MODEL_PATH}")

    v_norm = v / 9.0
    a_norm = a / 9.0
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Generating image on device: {device}")
    
    if seed is not None:
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed(seed)
    
    model = EmotionConditionedUNet().to(device)
    model.load_state_dict(torch.load(DIFFUSION_MODEL_PATH, map_location=device))
    model.eval()
    
    schedule = get_noise_schedule(timesteps)
    for key in schedule:
        schedule[key] = schedule[key].to(device)
    
    x = torch.randn(1, 3, 128, 128, device=device)
    v_tensor = torch.tensor([v_norm], dtype=torch.float32, device=device)
    a_tensor = torch.tensor([a_norm], dtype=torch.float32, device=device)
    
    # Use a smaller number of timesteps for faster generation in API if possible, 
    # but keeping 1000 for quality as per original code.
    # To speed up, one might reduce timesteps, but that requires a different schedule or model support.
    
    for i in reversed(range(timesteps)):
        t = torch.full((1,), i, device=device, dtype=torch.long)
        x = p_sample(model, x, t, i, v_tensor, a_tensor, schedule, device, guidance_scale)
    
    img = x.squeeze().permute(1, 2, 0).cpu().numpy()
    img = (img * 0.5 + 0.5).clip(0, 1)
    
    # Convert to PIL Image
    img_uint8 = (img * 255).astype(np.uint8)
    pil_img = Image.fromarray(img_uint8)
    
    return pil_img

# --- Main Service Function ---

async def generate_image_from_music(file: UploadFile):
    # Save uploaded file temporarily
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    try:
        # 1. Predict Emotion
        valence, arousal = predict_music_emotion(temp_filename)
        
        # 2. Generate Image
        pil_img = generate_image(valence, arousal)
        
        # 3. Convert to Base64
        buffered = io.BytesIO()
        pil_img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {
            "valence": valence,
            "arousal": arousal,
            "image": f"data:image/png;base64,{img_str}"
        }
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
