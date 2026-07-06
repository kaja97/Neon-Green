from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.project import Project
from models.plant import Plant, PlantStage
from models.farmer import FarmerLocation
from models.account import FarmerProfile
from .schemas import ProjectCreate, ProjectStatusUpdate
import uuid
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)

async def _get_farmer_profile(db: AsyncSession, account_id: uuid.UUID) -> FarmerProfile:
    """Resolve account ID to farmer profile."""
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return profile

async def get_plants(db: AsyncSession):
    result = await db.execute(select(Plant).where(Plant.is_active == True))
    return result.scalars().all()

async def get_plant_stages(db: AsyncSession, plant_id: uuid.UUID):
    result = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == plant_id).order_by(PlantStage.stage_order)
    )
    return result.scalars().all()

async def get_farming_methods():
    return [
        {"id": "organic", "name": "Organic Farming", "description": "Farming system that relies on fertilizers of organic origin."},
        {"id": "inorganic", "name": "Inorganic Farming", "description": "Farming system that uses synthetic chemicals and fertilizers."},
        {"id": "integrated", "name": "Integrated Farming", "description": "Combines organic and inorganic methods."}
    ]

async def create_project(db: AsyncSession, account_id: uuid.UUID, data: ProjectCreate):
    # Resolve farmer profile from account
    profile = await _get_farmer_profile(db, account_id)
    
    # Validate plant
    plant = await db.get(Plant, data.plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    # Validate location belongs to farmer
    location = await db.get(FarmerLocation, data.location_id)
    if not location or location.farmer_id != profile.id:
        raise HTTPException(status_code=404, detail="Location not found")
        
    # Find first stage
    result = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == data.plant_id).order_by(PlantStage.stage_order).limit(1)
    )
    first_stage = result.scalars().first()

    expected_harvest_date = data.planting_date + timedelta(days=plant.growth_duration_days)

    # Create project record
    project = Project(
        farmer_id=profile.id,
        plant_id=data.plant_id,
        location_id=data.location_id,
        land_detail_id=data.land_detail_id,
        name=data.name,
        area=data.area,
        area_unit=data.area_unit,
        farming_method=data.farming_method,
        planting_date=data.planting_date,
        status="active",
        current_stage_id=first_stage.id if first_stage else None,
        expected_harvest_date=expected_harvest_date,
        plan_generation_status="generating"
    )
    
    db.add(project)
    await db.flush()
    
    # Generate activity plan synchronously (no Celery needed)
    try:
        from modules.planner.sync_planner import generate_plan_for_project
        activity_count = await generate_plan_for_project(db, project.id)
        logger.info(f"Generated {activity_count} activities for project {project.id}")
    except Exception as e:
        logger.error(f"Failed to generate plan: {e}")
        project.plan_generation_status = "failed"
    
    await db.commit()
    await db.refresh(project)
    return project

async def list_projects(db: AsyncSession, account_id: uuid.UUID):
    profile = await _get_farmer_profile(db, account_id)
    result = await db.execute(select(Project).where(Project.farmer_id == profile.id))
    return result.scalars().all()

async def get_project(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    profile = await _get_farmer_profile(db, account_id)
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != profile.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

async def update_project_status(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, update_data: ProjectStatusUpdate):
    project = await get_project(db, project_id, account_id)
    project.status = update_data.status
    if project.status == "harvested":
        project.actual_harvest_date = date.today()
    await db.commit()
    await db.refresh(project)
    return project
