from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.project import Project
from models.plant import Plant, PlantStage
from models.farmer import FarmerLocation
from .schemas import ProjectCreate, ProjectStatusUpdate
import uuid
from datetime import date

async def get_plants(db: AsyncSession):
    result = await db.execute(select(Plant).where(Plant.is_active == True))
    return result.scalars().all()

async def get_plant_stages(db: AsyncSession, plant_id: uuid.UUID):
    result = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == plant_id).order_by(PlantStage.stage_order)
    )
    return result.scalars().all()

async def get_farming_methods():
    # Since these are static/seeded, we can just return a fixed list or query a DB if we created a model for it.
    # The spec in 09_IMPLEMENTATION_ROADMAP says "Seed farming_methods". 
    # But we don't have a model for it in models.py. 
    # We'll just return the static list that matches our seed data.
    return [
        {"id": "organic", "name": "Organic Farming", "description": "Farming system that relies on fertilizers of organic origin."},
        {"id": "inorganic", "name": "Inorganic Farming", "description": "Farming system that uses synthetic chemicals and fertilizers."},
        {"id": "integrated", "name": "Integrated Farming", "description": "Combines organic and inorganic methods."}
    ]

async def create_project(db: AsyncSession, account_id: uuid.UUID, data: ProjectCreate):
    # 1. Validate plant
    plant = await db.get(Plant, data.plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    # 2. Validate location
    location = await db.get(FarmerLocation, data.location_id)
    if not location or location.farmer_id != account_id:
        raise HTTPException(status_code=404, detail="Location not found")
        
    # Find first stage
    result = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == data.plant_id).order_by(PlantStage.stage_order).limit(1)
    )
    first_stage = result.scalars().first()

    # 3. Create project record
    project = Project(
        farmer_id=account_id,
        plant_id=data.plant_id,
        location_id=data.location_id,
        land_detail_id=data.land_detail_id,
        name=data.name,
        area=data.area,
        area_unit=data.area_unit,
        farming_method=data.farming_method,
        planting_date=data.planting_date,
        status="active",
        current_stage_id=first_stage.id if first_stage else None
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # TODO: TRIGGER generate_season_plan.delay(project.id)
    # TODO: TRIGGER refresh_weather_for_location.delay(location.latitude, location.longitude)
    
    return project

async def list_projects(db: AsyncSession, account_id: uuid.UUID):
    result = await db.execute(select(Project).where(Project.farmer_id == account_id))
    return result.scalars().all()

async def get_project(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != account_id:
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
