"""
Synchronous plan generator — extracted from Celery task so it can run
directly during project creation without requiring Redis/Celery.
"""
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

from models.project import Project
from models.plant import Plant, PlantStage, PlantWaterReq, PlantNutrientReq
from models.plant_pruning import PlantPruningGuide
from models.activity import ActivityPlan, FarmingActivity

logger = logging.getLogger(__name__)

async def generate_plan_for_project(db: AsyncSession, project_id: uuid.UUID):
    """Generate a full season activity plan for a project. Runs inline (no Celery)."""
    project = await db.get(Project, project_id)
    if not project:
        logger.error(f"Project {project_id} not found.")
        return

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
        generated_at=datetime.now(timezone.utc),
        version=1,
        is_active=True
    )
    db.add(new_plan)
    await db.flush()

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

        # Fetch pruning guides for this stage
        prune_res = await db.execute(
            select(PlantPruningGuide).where(PlantPruningGuide.plant_stage_id == stage.id)
        )
        pruning_guides = prune_res.scalars().all()

        for day_offset in range(stage.start_day, stage.end_day + 1):
            current_date = planting_date + timedelta(days=day_offset)

            # WATERING (every X days based on irrigation frequency)
            if water_req and water_req.frequency_days > 0 and day_offset % water_req.frequency_days == 0:
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

            # FERTILIZING (once at the start of each stage if nutrient req exists)
            if nutrient_req and day_offset == stage.start_day:
                n = float(nutrient_req.nitrogen_kg or 0)
                p = float(nutrient_req.phosphorus_kg or 0)
                k = float(nutrient_req.potassium_kg or 0)
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

            # PRUNING (based on trigger_day offset + frequency)
            for prune in pruning_guides:
                prune_start_day = stage.start_day + prune.trigger_day
                if prune.frequency_days > 0:
                    if day_offset >= prune_start_day and (day_offset - prune_start_day) % prune.frequency_days == 0:
                        due_days = 1 if prune.importance == "critical" else 3
                        desc_parts = [prune.pruning_method]
                        if prune.pre_pruning:
                            desc_parts.append(f"Before: {prune.pre_pruning}")
                        if prune.post_pruning:
                            desc_parts.append(f"After: {prune.post_pruning}")
                        if prune.tools_needed:
                            desc_parts.append(f"Tools: {prune.tools_needed}")
                        act = FarmingActivity(
                            plan_id=new_plan.id,
                            activity_type="pruning",
                            title=f"Pruning — {prune.pruning_type.replace('_', ' ').title()} ({stage.stage_name})",
                            description=" | ".join(desc_parts),
                            planned_date=current_date,
                            due_date=current_date + timedelta(days=due_days),
                            status="pending",
                        )
                        activities.append(act)
                elif day_offset == prune_start_day:
                    due_days = 1 if prune.importance == "critical" else 3
                    desc_parts = [prune.pruning_method]
                    if prune.pre_pruning:
                        desc_parts.append(f"Before: {prune.pre_pruning}")
                    if prune.post_pruning:
                        desc_parts.append(f"After: {prune.post_pruning}")
                    if prune.tools_needed:
                        desc_parts.append(f"Tools: {prune.tools_needed}")
                    act = FarmingActivity(
                        plan_id=new_plan.id,
                        activity_type="pruning",
                        title=f"Pruning — {prune.pruning_type.replace('_', ' ').title()} ({stage.stage_name})",
                        description=" | ".join(desc_parts),
                        planned_date=current_date,
                        due_date=current_date + timedelta(days=due_days),
                        status="pending",
                    )
                    activities.append(act)

            # SCOUTING/MONITORING (every 7 days)
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

    await db.flush()
    logger.info(f"Generated {len(activities)} activities for project {project_id}.")
    return len(activities)
