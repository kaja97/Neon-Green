from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

app = FastAPI(
    title="AgriFarm AI API",
    description="Personalized AI Farming Assistant Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to AgriFarm AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
