import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

from models.project import Project
from models.plant import Plant, PlantVariety, PlantStage, PlantWaterReq, PlantNutrientReq
from models.plant_fertilizer import PlantFertilizerRecommendation
from models.plant_pruning import PlantPruningGuide
from models.activity import ActivityPlan, FarmingActivity

logger = logging.getLogger(__name__)

def build_generic_stages(plant: Plant, duration: int):
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
            end_day=duration - 14,
            watch_for="Nutrient deficiencies"
        ),
        PlantStage(
            id=uuid.uuid4(),
            plant_id=plant.id,
            stage_name="Flowering & Harvest",
            stage_order=3,
            start_day=duration - 13,
            end_day=duration,
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

    variety = await db.get(PlantVariety, project.variety_id)
    if not variety:
        logger.error(f"Variety {project.variety_id} not found.")
        return

    # Fetch stages
    stages_res = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == plant.id).order_by(PlantStage.stage_order)
    )
    stages = stages_res.scalars().all()

    # Pre-flight checks and fallbacks
    if not stages:
        logger.warning(f"No stages for plant '{plant.common_name}'. Using generic 3-stage fallback.")
        stages = build_generic_stages(plant, variety.growth_duration_days)

    if not project.planting_date:
        logger.error(f"Project {project_id} has no planting date.")
        return
        
    baseline_duration = stages[-1].end_day if stages else variety.growth_duration_days
    scale_factor = variety.growth_duration_days / baseline_duration if baseline_duration > 0 else 1.0

    # Validate stage continuity — auto-patch gaps
    for i in range(len(stages) - 1):
        if stages[i].end_day != stages[i+1].start_day:
            logger.error(f"Stage gap: {plant.common_name} stage {i+1}→{i+2}. Auto-patching.")
            stages[i].end_day = stages[i+1].start_day

    from sqlalchemy import delete

    # Check for existing plan or create new
    existing_plan_res = await db.execute(
        select(ActivityPlan).where(ActivityPlan.project_id == project_id)
    )
    new_plan = existing_plan_res.scalars().first()

    if new_plan:
        # Clear previous activities to avoid duplicates on re-plan
        await db.execute(delete(FarmingActivity).where(FarmingActivity.plan_id == new_plan.id))
        new_plan.generated_at = datetime.now(timezone.utc)
        new_plan.version = (new_plan.version or 1) + 1
        new_plan.is_active = True
    else:
        new_plan = ActivityPlan(
            id=uuid.uuid4(),
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
        start_day_scaled = int(stage.start_day * scale_factor)
        end_day_scaled = int(stage.end_day * scale_factor)

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

        # Pruning Guides
        prune_res = await db.execute(
            select(PlantPruningGuide).where(PlantPruningGuide.plant_stage_id == stage.id)
        )
        pruning_guides = prune_res.scalars().all()

        for day_offset in range(start_day_scaled, end_day_scaled + 1):
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
            if day_offset == start_day_scaled + 2:
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

            # PRUNING: based on trigger_day offset + frequency
            for prune in pruning_guides:
                prune_start_day = start_day_scaled + int(prune.trigger_day * scale_factor)
                if prune.frequency_days > 0:
                    # Recurring pruning — generate every N days after trigger
                    freq_scaled = max(1, int(prune.frequency_days * scale_factor))
                    if day_offset >= prune_start_day and (day_offset - prune_start_day) % freq_scaled == 0:
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
                            is_ai_recommended=True,
                        )
                        activities.append(act)
                elif day_offset == prune_start_day:
                    # One-time pruning — generate only on trigger day
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
