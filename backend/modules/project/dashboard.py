from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from models.project import Project
from models.plant import PlantStage
from .schemas import DashboardResponse, FarmingCircleResponse, StageProgress
from .service import get_project, get_plant_stages
import uuid
from datetime import date

async def get_dashboard(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID) -> DashboardResponse:
    project = await get_project(db, project_id, account_id)
    stages = await get_plant_stages(db, project.plant_id)
    
    # Calculate farming circle
    days_since_planting = (date.today() - project.planting_date).days
    total_duration = sum([(s.end_day - s.start_day + 1) for s in stages]) if stages else 0
    
    stage_progress_list = []
    current_stage = None
    
    for s in stages:
        is_completed = days_since_planting > s.end_day
        is_current = s.start_day <= days_since_planting <= s.end_day
        
        # Calculate progress for this stage
        if is_completed:
            progress = 100
        elif is_current:
            stage_duration = s.end_day - s.start_day + 1
            days_in_stage = days_since_planting - s.start_day
            progress = int((days_in_stage / stage_duration) * 100)
            current_stage = s
        else:
            progress = 0
            
        stage_progress_list.append(
            StageProgress(
                stage=s,
                progress_percentage=progress,
                is_current=is_current,
                is_completed=is_completed
            )
        )
        
    farming_circle = FarmingCircleResponse(
        stages=stage_progress_list,
        current_day=days_since_planting,
        total_days=total_duration
    )
    
    # Build complete dashboard response
    # Other modules (weather, ai, planner) will be integrated here later.
    return DashboardResponse(
        project=project,
        current_stage=current_stage,
        farming_circle=farming_circle
    )
