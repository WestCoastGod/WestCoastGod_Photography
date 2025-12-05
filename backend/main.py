from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from stargazing.stargazing_service import get_7day_stargazing_forecast
from music_to_image.music_image_service import generate_image_from_music

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Oscar Photography API is running."}


@app.get("/api/stargazing-forecast")
def stargazing_forecast():
    return get_7day_stargazing_forecast()


@app.post("/api/music-to-image")
async def music_to_image(file: UploadFile = File(...)):
    return await generate_image_from_music(file)
