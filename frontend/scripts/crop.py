from PIL import Image

Image.MAX_IMAGE_PIXELS = None

# === 你的參數 ===
img_path = (
    r"C:\Users\cxoox\Desktop\stargazing-map-app\public\world2024.png"  # 原始圖片路徑
)
out_path = r"C:\Users\cxoox\Desktop\stargazing-map-app\public\hk_lightpollution.png"  # 輸出圖片路徑

# 原圖覆蓋的經緯度範圍
lat_min, lat_max = -90, 90
lon_min, lon_max = -180, 180

# 香港經緯度範圍
hk_lat_min, hk_lat_max = 21.8, 22.8
hk_lon_min, hk_lon_max = 113.5, 114.7

# === 開始計算 ===
img = Image.open(img_path)
w, h = img.size


# 經緯度轉像素座標
def geo_to_pixel(lat, lon):
    x = int((lon - lon_min) / (lon_max - lon_min) * w)
    y = int((lat_max - lat) / (lat_max - lat_min) * h)
    return x, y


# 左上、右下像素座標
x1, y1 = geo_to_pixel(hk_lat_max, hk_lon_min)  # 左上
x2, y2 = geo_to_pixel(hk_lat_min, hk_lon_max)  # 右下

# 裁剪
box = (x1, y1, x2, y2)
cropped = img.crop(box)
cropped.save(out_path)
print(f"已裁剪並保存到 {out_path}")
