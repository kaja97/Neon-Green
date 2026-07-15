import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

from models.project import Project
from models.plant import Plant, PlantStage, PlantWaterReq, PlantNutrientReq
from models.plant_fertilizer import PlantFertilizerRecommendation
from models.activity import ActivityPlan, FarmingActivity

logger = logging.getLogger(__name__)

def build_generic_stages(plant: Plant):
    """Fallback: Build 3 generic stages if no stage data is seeded."""
    return [
        PlantStage(
            id=uuid.uuid4(),
            plant_id=plant.id,
            stage_name="Planting & Establishment",
            stage_order=1,
            start_day=0,
            end_day=14,
            watch_for="Pest attacks on new shoots"
        ),
        PlantStage(
            id=uuid.uuid4(),
            plant_id=plant.id,
            stage_name="Vegetative Growth",
            stage_order=2,
            start_day=15,
            end_day=plant.growth_duration_days - 14,
            watch_for="Nutrient deficiencies"
        ),
        PlantStage(
            id=uuid.uuid4(),
            plant_id=plant.id,
            stage_name="Flowering & Harvest",
            stage_order=3,
            start_day=plant.growth_duration_days - 13,
            end_day=plant.growth_duration_days,
            watch_for="Fruit damage, ripening signs"
        )
    ]

async def generate_season_plan(project_id: str | uuid.UUID, db: AsyncSession):
    """
    Generate a full season activity plan for a project. 
    Pure async function, completely decoupled from Celery.
    """
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

    # Pre-flight checks and fallbacks
    if not stages:
        logger.warning(f"No stages for plant '{plant.common_name}'. Using generic 3-stage fallback.")
        stages = build_generic_stages(plant)
    else:
        # Validate stage continuity — auto-patch gaps
        for i in range(len(stages) - 1):
            if stages[i].end_day != stages[i+1].start_day:
                logger.error(f"Stage gap: {plant.common_name} stage {i+1}→{i+2}. Auto-patching.")
                stages[i].end_day = stages[i+1].start_day

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
        # Water Requirements
        water_req_res = await db.execute(
            select(PlantWaterReq).where(PlantWaterReq.plant_stage_id == stage.id)
        )
        water_req = water_req_res.scalars().first()

        # Fertilizer Recommendations
        fert_res = await db.execute(
            select(PlantFertilizerRecommendation).where(PlantFertilizerRecommendation.plant_stage_id == stage.id)
        )
        fertilizers = fert_res.scalars().all()

        for day_offset in range(stage.start_day, stage.end_day + 1):
            current_date = planting_date + timedelta(days=day_offset)

            # WATERING: every X days based on irrigation frequency
            if water_req and water_req.frequency_days > 0 and day_offset % water_req.frequency_days == 0:
                water_liters = float(water_req.water_mm_per_day) * float(project.area) * 4046.86  # approx liters/acre
                act = FarmingActivity(
                    plan_id=new_plan.id,
                    activity_type="irrigation",
                    title=f"Watering ({stage.stage_name})",
                    description=f"Requires ~{water_req.water_mm_per_day}mm (approx {water_liters:.1f} liters).",
                    planned_date=current_date,
                    due_date=current_date,
                    status="pending",
                    is_ai_recommended=True,
                )
                activities.append(act)

            # FERTILIZING: start of each stage + 2 days
            if day_offset == stage.start_day + 2:
                for fert in fertilizers:
                    # Organic / Inorganic filtering rules
                    if project.farming_method == "organic" and fert.farming_method != "organic":
                        continue
                    if project.farming_method == "inorganic" and fert.farming_method == "organic":
                        continue

                    qty = float(fert.application_rate_per_acre_kg) * float(project.area)
                    is_organic = fert.farming_method == "organic"
                    act = FarmingActivity(
                        plan_id=new_plan.id,
                        activity_type="fertilizer",
                        title=f"Apply {fert.fertilizer_name} ({stage.stage_name})",
                        description=f"Apply {qty:.2f} kg of {fert.fertilizer_name}. ({'Organic' if is_organic else 'Conventional'})",
                        planned_date=current_date,
                        due_date=current_date + timedelta(days=3),
                        status="pending",
                        is_ai_recommended=True,
                    )
                    activities.append(act)

            # SCOUTING/MONITORING: every 7 days
            if day_offset % 7 == 0:
                watch_desc = f"Watch for: {stage.watch_for}" if stage.watch_for else "General health check."
                act = FarmingActivity(
                    plan_id=new_plan.id,
                    activity_type="monitoring",
                    title=f"Scouting & Monitoring ({stage.stage_name})",
                    description=watch_desc,
                    planned_date=current_date,
                    due_date=current_date,
                    status="pending",
                    is_ai_recommended=True,
                )
                activities.append(act)

    db.add_all(activities)

    # Update project status
    project.plan_generation_status = "completed"
    project.status = "active"

    await db.flush()
    logger.info(f"Generated {len(activities)} activities for project {project_id}.")
    return len(activities)
