import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class SinusoidalPositionEmbeddings(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim

    def forward(self, time):
        device = time.device
        half_dim = self.dim // 2
        embeddings = np.log(10000) / (half_dim - 1)
        embeddings = torch.exp(torch.arange(half_dim, device=device) * -embeddings)
        embeddings = time[:, None] * embeddings[None, :]
        embeddings = torch.cat((embeddings.sin(), embeddings.cos()), dim=-1)
        return embeddings


class SelfAttention(nn.Module):
    def __init__(self, channels, num_heads=8):
        super().__init__()
        self.channels = channels
        self.num_heads = num_heads
        assert channels % num_heads == 0
        
        self.norm = nn.GroupNorm(8, channels)
        self.qkv = nn.Conv2d(channels, channels * 3, 1)
        self.proj = nn.Conv2d(channels, channels, 1)
    
    def forward(self, x):
        B, C, H, W = x.shape
        residual = x
        x = self.norm(x)
        
        qkv = self.qkv(x)
        qkv = qkv.reshape(B, 3, self.num_heads, C // self.num_heads, H * W)
        qkv = qkv.permute(1, 0, 2, 4, 3)
        q, k, v = qkv[0], qkv[1], qkv[2]
        
        scale = (C // self.num_heads) ** -0.5
        attn = (q @ k.transpose(-2, -1)) * scale
        attn = F.softmax(attn, dim=-1)
        
        out = attn @ v
        out = out.permute(0, 1, 3, 2).reshape(B, C, H, W)
        out = self.proj(out)
        
        return out + residual


class EmotionConditionedUNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=3, time_dim=256, emotion_dim=2):
        super().__init__()
        
        self.time_mlp = nn.Sequential(
            SinusoidalPositionEmbeddings(time_dim),
            nn.Linear(time_dim, time_dim * 4),
            nn.GELU(),
            nn.Linear(time_dim * 4, time_dim),
        )
        
        self.emotion_embed = nn.Sequential(
            nn.Linear(emotion_dim, time_dim),
            nn.GELU(),
            nn.Linear(time_dim, time_dim),
        )
        
        self.enc1 = self.conv_block(in_channels, 64, time_dim)
        self.enc2 = self.conv_block(64, 128, time_dim)
        self.enc3 = self.conv_block(128, 256, time_dim)
        self.attn3 = SelfAttention(256, num_heads=8)
        self.enc4 = self.conv_block(256, 512, time_dim)
        self.enc5 = self.conv_block(512, 1024, time_dim)
        
        self.bottleneck = self.conv_block(1024, 1024, time_dim)
        
        self.dec5 = self.conv_block(1024 + 1024, 512, time_dim)
        self.dec4 = self.conv_block(512 + 512, 256, time_dim)
        self.attn4 = SelfAttention(256, num_heads=8)
        self.dec3 = self.conv_block(256 + 256, 128, time_dim)
        self.dec2 = self.conv_block(128 + 128, 64, time_dim)
        self.dec1 = self.conv_block(64 + 64, 64, time_dim)
        
        self.final = nn.Conv2d(64, out_channels, 1)
        
        self.pool = nn.MaxPool2d(2)
        self.upsample = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False)
    
    def conv_block(self, in_ch, out_ch, time_dim):
        return nn.ModuleDict({
            'conv1': nn.Conv2d(in_ch, out_ch, 3, padding=1),
            'norm1': nn.GroupNorm(8, out_ch),
            'conv2': nn.Conv2d(out_ch, out_ch, 3, padding=1),
            'norm2': nn.GroupNorm(8, out_ch),
            'conv3': nn.Conv2d(out_ch, out_ch, 3, padding=1),
            'norm3': nn.GroupNorm(8, out_ch),
            'conv4': nn.Conv2d(out_ch, out_ch, 3, padding=1),
            'norm4': nn.GroupNorm(8, out_ch),
            'residual_proj': nn.Conv2d(in_ch, out_ch, 1) if in_ch != out_ch else nn.Identity(),
            'time_emb': nn.Linear(time_dim, out_ch),
            'va_scale': nn.Linear(time_dim, out_ch),
            'va_shift': nn.Linear(time_dim, out_ch),
        })
    
    def apply_conv_block(self, x, block, time_emb, emotion_emb):
        residual = block['residual_proj'](x)
        
        h = block['conv1'](x)
        h = block['norm1'](h)
        h = F.silu(h)
        
        time_cond = block['time_emb'](time_emb)[:, :, None, None]
        h = h + time_cond
        
        h = block['conv2'](h)
        h = block['norm2'](h)
        h = F.silu(h + residual)
        
        residual2 = h
        h = block['conv3'](h)
        h = block['norm3'](h)
        
        va_scale = block['va_scale'](emotion_emb)[:, :, None, None]
        va_shift = block['va_shift'](emotion_emb)[:, :, None, None]
        h = h * (1 + va_scale * 0.3) + va_shift * 0.3
        
        h = F.silu(h)
        h = block['conv4'](h)
        h = block['norm4'](h)
        h = F.silu(h + residual2)
        
        return h
    
    def forward(self, x, timestep, valence, arousal):
        t_emb = self.time_mlp(timestep)
        emotion = torch.stack([valence, arousal], dim=1)
        e_emb = self.emotion_embed(emotion)
        
        e1 = self.apply_conv_block(x, self.enc1, t_emb, e_emb)
        e2 = self.apply_conv_block(self.pool(e1), self.enc2, t_emb, e_emb)
        e3 = self.apply_conv_block(self.pool(e2), self.enc3, t_emb, e_emb)
        e3 = self.attn3(e3)
        e4 = self.apply_conv_block(self.pool(e3), self.enc4, t_emb, e_emb)
        e5 = self.apply_conv_block(self.pool(e4), self.enc5, t_emb, e_emb)
        
        b = self.apply_conv_block(self.pool(e5), self.bottleneck, t_emb, e_emb)
        
        d5 = self.apply_conv_block(torch.cat([self.upsample(b), e5], dim=1), self.dec5, t_emb, e_emb)
        d4 = self.apply_conv_block(torch.cat([self.upsample(d5), e4], dim=1), self.dec4, t_emb, e_emb)
        d4 = self.attn4(d4)
        d3 = self.apply_conv_block(torch.cat([self.upsample(d4), e3], dim=1), self.dec3, t_emb, e_emb)
        d2 = self.apply_conv_block(torch.cat([self.upsample(d3), e2], dim=1), self.dec2, t_emb, e_emb)
        d1 = self.apply_conv_block(torch.cat([self.upsample(d2), e1], dim=1), self.dec1, t_emb, e_emb)
        
        return self.final(d1)
