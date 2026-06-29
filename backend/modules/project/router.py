from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from database import get_db
from dependencies import get_current_user
from models.account import Account
from .schemas import (
    ProjectCreate, ProjectResponse, ProjectStatusUpdate,
    DashboardResponse, PlantResponse, PlantStageResponse,
    FarmingMethodResponse
)
from . import service
from . import dashboard

router = APIRouter(prefix="/projects", tags=["projects"])
master_router = APIRouter(tags=["master-data"])

# --- Master Data Endpoints ---
@master_router.get("/plants", response_model=List[PlantResponse])
async def list_plants(db: AsyncSession = Depends(get_db)):
    return await service.get_plants(db)

@master_router.get("/plants/{plant_id}/stages", response_model=List[PlantStageResponse])
async def list_plant_stages(plant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await service.get_plant_stages(db, plant_id)

@master_router.get("/farming-methods", response_model=List[FarmingMethodResponse])
async def list_farming_methods():
    return await service.get_farming_methods()

# --- Project Endpoints ---
@router.post("", response_model=ProjectResponse)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.create_project(db, current_user.id, data)

@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.list_projects(db, current_user.id)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.get_project(db, project_id, current_user.id)

@router.patch("/{project_id}/status", response_model=ProjectResponse)
async def update_status(
    project_id: uuid.UUID,
    status_data: ProjectStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.update_project_status(db, project_id, current_user.id, status_data)

@router.get("/{project_id}/dashboard", response_model=DashboardResponse)
async def get_project_dashboard(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await dashboard.get_dashboard(db, project_id, current_user.id)
