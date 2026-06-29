from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from modules.auth import router as auth_router
from modules.farmer import router as farmer_router
from modules.project import router as project_router
from modules.project import master_router
from modules.planner import router as planner_router

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

app.include_router(auth_router, prefix="/api/v1")
app.include_router(farmer_router, prefix="/api/v1")
app.include_router(project_router, prefix="/api/v1")
app.include_router(master_router, prefix="/api/v1")
app.include_router(planner_router, prefix="/api/v1")
