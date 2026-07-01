import asyncio
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy.future import select
from celery.utils.log import get_task_logger

from .celery_app import celery_app
from database import async_session
from models.project import Project
from models.plant import Plant, PlantStage, PlantWaterReq, PlantNutrientReq
from models.activity import ActivityPlan, FarmingActivity

logger = get_task_logger(__name__)

async def _generate_season_plan(project_id_str: str):
    project_id = uuid.UUID(project_id_str)
    
    async with async_session() as db:
        # Fetch project
        project = await db.get(Project, project_id)
        if not project:
            logger.error(f"Project {project_id} not found.")
            return
            
        # Fetch plant
        plant = await db.get(Plant, project.plant_id)
        if not plant:
            logger.error(f"Plant {project.plant_id} not found.")
            return
            
        # Fetch stages
        stages_res = await db.execute(
            select(PlantStage).where(PlantStage.plant_id == plant.id).order_by(PlantStage.stage_order)
        )
        stages = stages_res.scalars().all()
        
        # Inactivate old plans
        old_plans_res = await db.execute(
            select(ActivityPlan).where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
        )
        for old_plan in old_plans_res.scalars().all():
            old_plan.is_active = False
            
        # Create new plan
        new_plan = ActivityPlan(
            project_id=project_id,
            generated_at=datetime.utcnow(),
            version=1,
            is_active=True
        )
        db.add(new_plan)
        await db.flush() # get new_plan.id
        
        activities = []
        planting_date = project.planting_date
        
        for stage in stages:
            # Fetch water requirements for this stage
            water_req_res = await db.execute(
                select(PlantWaterReq).where(PlantWaterReq.plant_stage_id == stage.id)
            )
            water_req = water_req_res.scalars().first()
            
            # Fetch nutrient requirements for this stage
            nutrient_req_res = await db.execute(
                select(PlantNutrientReq).where(PlantNutrientReq.plant_stage_id == stage.id)
            )
            nutrient_req = nutrient_req_res.scalars().first()
            
            # Create activities for the duration of the stage
            stage_duration = stage.end_day - stage.start_day + 1
            
            for day_offset in range(stage.start_day, stage.end_day + 1):
                current_date = planting_date + timedelta(days=day_offset)
                
                # WATERING (e.g. every X days)
                if water_req and day_offset % water_req.frequency_days == 0:
                    act = FarmingActivity(
                        plan_id=new_plan.id,
                        activity_type="watering",
                        title=f"Watering ({stage.stage_name})",
                        description=f"Requires ~{water_req.water_mm_per_day}mm. {water_req.drought_tolerance} drought tolerance.",
                        planned_date=current_date,
                        due_date=current_date,
                        status="pending"
                    )
                    activities.append(act)
                    
                # FERTILIZING (once at the start of stage if nutrient req exists)
                if nutrient_req and day_offset == stage.start_day:
                    n = nutrient_req.nitrogen_kg or 0
                    p = nutrient_req.phosphorus_kg or 0
                    k = nutrient_req.potassium_kg or 0
                    if n > 0 or p > 0 or k > 0:
                        act = FarmingActivity(
                            plan_id=new_plan.id,
                            activity_type="fertilizing",
                            title=f"Apply Fertilizers ({stage.stage_name})",
                            description=f"NPK gap: {n}kg N, {p}kg P, {k}kg K. ({project.farming_method} method)",
                            planned_date=current_date,
                            due_date=current_date + timedelta(days=3),
                            status="pending"
                        )
                        activities.append(act)
                        
                # SCOUTING/MONITORING (e.g. every 7 days)
                if day_offset % 7 == 0:
                    watch_desc = f"Watch for: {stage.watch_for}" if stage.watch_for else "General health check."
                    act = FarmingActivity(
                        plan_id=new_plan.id,
                        activity_type="monitoring",
                        title=f"Scouting & Monitoring ({stage.stage_name})",
                        description=watch_desc,
                        planned_date=current_date,
                        due_date=current_date,
                        status="pending"
                    )
                    activities.append(act)
        
        db.add_all(activities)
        
        # Update project status
        project.plan_generation_status = "completed"
        db.add(project)
        
        await db.commit()
        logger.info(f"Generated {len(activities)} activities for project {project_id}.")

@celery_app.task(name="tasks.planner_tasks.generate_season_plan")
def generate_season_plan(project_id_str: str):
    asyncio.run(_generate_season_plan(project_id_str))
