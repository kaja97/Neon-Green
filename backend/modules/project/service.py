"""
Project service — project CRUD with status machine enforcement.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from models.project import Project
from models.plant import Plant, PlantStage
from models.farmer import FarmerLocation
from models.account import FarmerProfile
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.enums import ProjectStatus, PROJECT_STATUS_TRANSITIONS
from core.cache import invalidate_dashboard_cache
from .schemas import ProjectCreate, ProjectStatusUpdate, ProjectUpdate
import uuid
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)


async def _get_farmer_profile(db: AsyncSession, account_id: uuid.UUID) -> FarmerProfile:
    """Resolve account ID to farmer profile."""
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = result.scalars().first()
    if not profile:
        raise AppException(ErrorCode.FARMER_PROFILE_NOT_FOUND)
    return profile


async def get_plants(db: AsyncSession):
    result = await db.execute(select(Plant).where(Plant.is_active == True))
    return result.scalars().all()


async def get_plant_detail(db: AsyncSession, plant_id: uuid.UUID):
    plant = await db.get(Plant, plant_id)
    if not plant:
        raise AppException(ErrorCode.PLANT_NOT_FOUND)
    return plant


async def get_plant_stages(db: AsyncSession, plant_id: uuid.UUID):
    result = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == plant_id).order_by(PlantStage.stage_order)
    )
    return result.scalars().all()


async def get_farming_methods():
    # Display names are human-readable; the `id` is the enum value stored on the
    # project. "Conventional" is the user-facing label for the `inorganic` value
    # (kept consistent with the New Project wizard and Edit modal).
    return [
        {"id": "organic", "name": "Organic", "description": "Farming system that relies on fertilizers of organic origin."},
        {"id": "inorganic", "name": "Conventional", "description": "Farming system that uses synthetic chemicals and fertilizers."},
        {"id": "integrated", "name": "Integrated", "description": "Combines organic and conventional methods."}
    ]


async def create_project(db: AsyncSession, account_id: uuid.UUID, data: ProjectCreate):
    profile = await _get_farmer_profile(db, account_id)

    # Validate plant
    plant = await db.get(Plant, data.plant_id)
    if not plant:
        raise AppException(ErrorCode.PROJECT_INVALID_PLANT)

    # Validate location belongs to farmer
    location = await db.get(FarmerLocation, data.location_id)
    if not location or location.farmer_id != profile.id:
        raise AppException(ErrorCode.PROJECT_INVALID_LOCATION)

    # Validate land_detail if provided
    if data.land_detail_id:
        from models.farmer import FarmerLandDetail
        land = await db.get(FarmerLandDetail, data.land_detail_id)
        if not land or land.farmer_id != profile.id:
            raise AppException(ErrorCode.PROJECT_INVALID_LAND_DETAIL)

    # Find first stage
    result = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == data.plant_id)
        .order_by(PlantStage.stage_order).limit(1)
    )
    first_stage = result.scalars().first()

    expected_harvest_date = data.planting_date + timedelta(days=plant.growth_duration_days)

    project = Project(
        farmer_id=profile.id,
        plant_id=data.plant_id,
        location_id=data.location_id,
        land_detail_id=data.land_detail_id,
        name=data.name,
        area=data.area,
        area_unit=data.area_unit,
        farming_method=data.farming_method.value,
        planting_date=data.planting_date,
        status="active",
        current_stage_id=first_stage.id if first_stage else None,
        expected_harvest_date=expected_harvest_date,
        plan_generation_status="generating",
    )

    db.add(project)
    await db.flush()

    # Generate activity plan via Celery
    try:
        from tasks.planner_tasks import generate_season_plan_task
        generate_season_plan_task.delay(str(project.id))
        logger.info("Dispatched plan generation for project %s", project.id)
    except Exception as e:
        logger.error("Failed to dispatch plan generation task: %s", e)
        project.plan_generation_status = "failed"

    await db.commit()
    
    # Eager load the plant relation when returning the created project
    res = await db.execute(
        select(Project)
        .where(Project.id == project.id)
        .options(selectinload(Project.plant))
    )
    project = res.scalars().first()
    return project


async def list_projects(db: AsyncSession, account_id: uuid.UUID):
    profile = await _get_farmer_profile(db, account_id)
    result = await db.execute(
        select(Project)
        .where(Project.farmer_id == profile.id)
        .options(selectinload(Project.plant))
        .order_by(Project.created_at.desc())
    )
    return result.scalars().all()


async def get_project(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    profile = await _get_farmer_profile(db, account_id)
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.plant))
    )
    project = result.scalars().first()
    if not project or project.farmer_id != profile.id:
        raise AppException(ErrorCode.PROJECT_NOT_FOUND)
    return project


async def update_project_status(
    db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID,
    update_data: ProjectStatusUpdate
):
    """Update project status with state machine enforcement."""
    project = await get_project(db, project_id, account_id)

    current_status = ProjectStatus(project.status)
    new_status = update_data.status

    # Validate state machine transition
    allowed = PROJECT_STATUS_TRANSITIONS.get(current_status, [])
    if new_status not in allowed:
        raise AppException(
            ErrorCode.PROJECT_INVALID_STATUS_TRANSITION,
            detail=f"Cannot transition from '{current_status.value}' to '{new_status.value}'. "
                   f"Allowed: {[s.value for s in allowed]}",
        )

    # Harvest requires a date
    if new_status == ProjectStatus.HARVESTED:
        project.actual_harvest_date = update_data.harvest_date or date.today()

    project.status = new_status.value
    await db.commit()
    await db.refresh(project)

    # Invalidate dashboard cache
    try:
        await invalidate_dashboard_cache(str(project_id))
    except Exception:
        pass

    return project


async def update_project(
    db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID,
    update_data: ProjectUpdate
):
    """Update project fields. Cannot change plant/location after plan generation."""
    project = await get_project(db, project_id, account_id)

    # Prevent editing terminal projects
    if project.status in ("harvested", "failed"):
        raise AppException(ErrorCode.PROJECT_ALREADY_HARVESTED)

    for key, value in update_data.model_dump(exclude_unset=True).items():
        if key == "farming_method" and value is not None:
            setattr(project, key, value.value)
        else:
            setattr(project, key, value)

    await db.commit()
    await db.refresh(project)

    try:
        await invalidate_dashboard_cache(str(project_id))
    except Exception:
        pass

    return project


async def delete_project(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    project = await get_project(db, project_id, account_id)
    await db.delete(project)
    await db.commit()

    try:
        await invalidate_dashboard_cache(str(project_id))
    except Exception:
        pass
