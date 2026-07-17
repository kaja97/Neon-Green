from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from database import get_db
from dependencies import get_current_user, get_project_service, get_dashboard_service
from models.account import Account
from core.response import success_response, created_response
from .schemas import (
    ProjectCreate, ProjectResponse, ProjectStatusUpdate, ProjectUpdate,
    DashboardResponse, PlantResponse, PlantStageResponse, PlantVarietyResponse,
    FarmingMethodResponse
)
from .service import ProjectService
from .dashboard import DashboardService

router = APIRouter(prefix="/projects", tags=["projects"])
master_router = APIRouter(tags=["master-data"])

# --- Master Data Endpoints ---
@master_router.get("/plants", status_code=200)
async def list_plants(
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service)
):
    plants = await project_service.get_plants(db)
    return success_response([PlantResponse.model_validate(p).model_dump() for p in plants])

@master_router.get("/plants/{plant_id}/stages", status_code=200)
async def list_plant_stages(
    plant_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service)
):
    stages = await project_service.get_plant_stages(db, plant_id)
    return success_response([PlantStageResponse.model_validate(s).model_dump() for s in stages])

@master_router.get("/plants/{plant_id}/varieties", status_code=200)
async def list_plant_varieties(
    plant_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service)
):
    varieties = await project_service.get_plant_varieties(db, plant_id)
    return success_response([PlantVarietyResponse.model_validate(v).model_dump() for v in varieties])

@master_router.get("/farming-methods", status_code=200)
async def list_farming_methods(
    project_service: ProjectService = Depends(get_project_service)
):
    methods = await project_service.get_farming_methods()
    return success_response(methods)

# --- Project Endpoints ---
@router.post("", status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    project = await project_service.create_project(db, current_user.id, data)
    return created_response(ProjectResponse.model_validate(project).model_dump())

@router.get("", status_code=200)
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    projects = await project_service.list_projects(db, current_user.id)
    return success_response([ProjectResponse.model_validate(p).model_dump() for p in projects])

@router.get("/{project_id}", status_code=200)
async def get_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    project = await project_service.get_project(db, project_id, current_user.id)
    return success_response(ProjectResponse.model_validate(project).model_dump())

@router.patch("/{project_id}/status", status_code=200)
async def update_status(
    project_id: uuid.UUID,
    status_data: ProjectStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    project = await project_service.update_project_status(db, project_id, current_user.id, status_data)
    return success_response(ProjectResponse.model_validate(project).model_dump())

@router.put("/{project_id}", status_code=200)
async def update_project(
    project_id: uuid.UUID,
    update_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    project = await project_service.update_project(db, project_id, current_user.id, update_data)
    return success_response(ProjectResponse.model_validate(project).model_dump())

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    await project_service.delete_project(db, project_id, current_user.id)
    return None

@router.get("/{project_id}/dashboard", status_code=200)
async def get_project_dashboard(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    data = await dashboard_service.get_dashboard(db, project_id, current_user.id)
    return success_response(data.model_dump(mode='json'))
