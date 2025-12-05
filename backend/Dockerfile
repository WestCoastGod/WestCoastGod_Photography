# Use Python 3.10 (Stable for PyTorch)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for Librosa/Audio)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to cache installation
COPY requirements.txt .

# Install Python dependencies
# We use the CPU version of PyTorch to keep the image size smaller for hosting
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of the application
COPY . .

# Create a writable directory for matplotlib/cache if needed
RUN mkdir -p /app/cache && chmod 777 /app/cache
ENV MPLCONFIGDIR=/app/cache

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
