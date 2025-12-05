from PIL import Image
import os

folder = r"photos"
low_quality_folder = r"low_quality"
MAX_SIZE = int(1.5 * 1048576)  # 1.5MB for reduced image
MAX_PIXELS = 10000000  # 10MP for reduced image
LOW_QUALITY_TARGET = 200 * 1024  # 200KB for low quality preview
LOW_QUALITY_WIDTH = 1280  # Max width for low quality

os.makedirs(low_quality_folder, exist_ok=True)

for image_file in os.listdir(folder):
    if not image_file.lower().endswith(".jpg"):
        continue
    file_path = os.path.join(folder, image_file)

    # --- Generate low quality preview for web (always) ---
    with Image.open(file_path) as img:
        img_low = img.copy()
        # Resize if needed
        if img_low.width > LOW_QUALITY_WIDTH:
            ratio = LOW_QUALITY_WIDTH / img_low.width
            new_size = (LOW_QUALITY_WIDTH, int(img_low.height * ratio))
            img_low = img_low.resize(new_size, Image.Resampling.LANCZOS)
        # Compress to ~200KB
        low_quality_path = os.path.join(low_quality_folder, image_file)
        quality = 60
        temp_path = os.path.join(low_quality_folder, "temp_" + image_file)
        while True:
            img_low.save(temp_path, quality=quality, dpi=(72, 72), optimize=True)
            if os.path.getsize(temp_path) <= LOW_QUALITY_TARGET or quality <= 20:
                break
            quality -= 5
        os.replace(temp_path, low_quality_path)
        print(
            f"Saved low quality preview: {low_quality_path} (quality={quality}, size={os.path.getsize(low_quality_path)//1024}KB)"
        )

    # --- Reduce original image if needed (for enlargement/fullscreen) ---
    # Skip if already small enough
    if os.path.getsize(file_path) <= MAX_SIZE:
        continue

    # Resize if too many pixels
    with Image.open(file_path) as img:
        resized = False
        while img.size[0] * img.size[1] > MAX_PIXELS:
            new_size = (int(img.size[0] * 0.8), int(img.size[1] * 0.8))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            resized = True
            print(f"Resized {image_file} to {new_size} pixels")
        if resized:
            img.save(file_path, quality=95)

    # Compress to ≤1.5MB
    if os.path.getsize(file_path) > MAX_SIZE:
        with Image.open(file_path) as img:
            quality = 95
            temp_path = os.path.join(folder, "temp_" + image_file)
            while True:
                img.save(temp_path, quality=quality)
                if os.path.getsize(temp_path) <= MAX_SIZE or quality <= 20:
                    break
                quality -= 5
            os.replace(temp_path, file_path)
            print(
                f"Compressed {image_file} to <= 1.5MB (quality={quality}, size={os.path.getsize(file_path)//1024}KB)"
            )
