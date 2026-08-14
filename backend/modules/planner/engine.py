"""
Synchronous Plan Generator
Generates a complete seasonal farming schedule with rich ActivityDetail records
for Irrigation, Fertilizer, Pruning, Pest Control, Monitoring, and Harvesting.
"""
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
import logging

from models.project import Project
from models.plant import Plant, PlantVariety, PlantStage, PlantWaterReq, PlantNutrientReq
from models.plant_fertilizer import PlantFertilizerRecommendation
from models.plant_pruning import PlantPruningGuide
from models.plant_health import PlantDisease, DiseaseSolution
from models.activity import ActivityPlan, FarmingActivity, ActivityDetail

logger = logging.getLogger(__name__)

async def generate_season_plan(db: AsyncSession, project_id: uuid.UUID):
    """Generate a full season activity plan with rich details for a project."""
    project = await db.get(Project, project_id)
    if not project:
        logger.error(f"Project {project_id} not found.")
        return 0

    plant = await db.get(Plant, project.plant_id)
    if not plant:
        logger.error(f"Plant {project.plant_id} not found.")
        return 0

    variety = None
    if project.variety_id:
        variety = await db.get(PlantVariety, project.variety_id)

    # Fetch stages
    stages_res = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == plant.id).order_by(PlantStage.stage_order)
    )
    stages = stages_res.scalars().all()

    if not stages:
        logger.error(f"No stages found for plant {plant.common_name}.")
        return 0

    # Fetch diseases and solutions for pest control activities
    diseases_res = await db.execute(
        select(PlantDisease).where(PlantDisease.plant_id == plant.id)
    )
    plant_diseases = diseases_res.scalars().all()

    # Scaling factor based on variety duration vs baseline duration
    baseline_duration = stages[-1].end_day if stages else (variety.growth_duration_days if variety else 90)
    target_duration = variety.growth_duration_days if (variety and variety.growth_duration_days) else baseline_duration
    scale_factor = target_duration / baseline_duration if baseline_duration > 0 else 1.0

    # Existing plan check
    existing_plan_res = await db.execute(
        select(ActivityPlan).where(ActivityPlan.project_id == project_id)
    )
    plan = existing_plan_res.scalars().first()

    if plan:
        # Delete old activities (cascades to activity_details)
        await db.execute(delete(FarmingActivity).where(FarmingActivity.plan_id == plan.id))
        plan.generated_at = datetime.now(timezone.utc)
        plan.version = (plan.version or 1) + 1
        plan.is_active = True
    else:
        plan = ActivityPlan(
            id=uuid.uuid4(),
            project_id=project_id,
            generated_at=datetime.now(timezone.utc),
            version=1,
            is_active=True
        )
        db.add(plan)
        await db.flush()

    activities_to_add = []
    details_to_add = []
    planting_date = project.planting_date or datetime.now(timezone.utc).date()
    area_acres = float(project.area or 1.0)
    method = project.farming_method or "integrated"

    for stage_idx, stage in enumerate(stages):
        start_day_scaled = int(stage.start_day * scale_factor)
        end_day_scaled = int(stage.end_day * scale_factor)

        # 1. Fetch stage water requirements
        water_req_res = await db.execute(
            select(PlantWaterReq).where(PlantWaterReq.plant_stage_id == stage.id)
        )
        water_req = water_req_res.scalars().first()

        # 2. Fetch fertilizer recommendations for this stage & method
        fert_res = await db.execute(
            select(PlantFertilizerRecommendation).where(
                PlantFertilizerRecommendation.plant_stage_id == stage.id
            )
        )
        fert_recs = fert_res.scalars().all()
        # Filter by method (organic vs conventional/inorganic vs integrated)
        stage_ferts = [f for f in fert_recs if f.farming_method == method]
        if not stage_ferts and fert_recs:
            stage_ferts = [fert_recs[0]]

        # 3. Fetch pruning guides for this stage
        prune_res = await db.execute(
            select(PlantPruningGuide).where(PlantPruningGuide.plant_stage_id == stage.id)
        )
        pruning_guides = prune_res.scalars().all()

        for day_offset in range(start_day_scaled, end_day_scaled + 1):
            current_date = planting_date + timedelta(days=day_offset)

            # ── A. IRRIGATION / WATERING ─────────────────────────────────
            if water_req and water_req.frequency_days > 0 and day_offset % water_req.frequency_days == 0:
                water_mm = float(water_req.water_mm_per_day)
                # 1 mm over 1 acre ≈ 4,046.86 liters
                water_liters = round(water_mm * area_acres * 4046.86, 1)

                act_id = uuid.uuid4()
                act = FarmingActivity(
                    id=act_id,
                    plan_id=plan.id,
                    activity_type="irrigation",
                    title=f"Irrigation ({stage.stage_name})",
                    description=f"Provide ~{water_mm}mm of water (~{water_liters:,.0f} L across {area_acres} acres). Drought tolerance: {water_req.drought_tolerance}.",
                    planned_date=current_date,
                    due_date=current_date,
                    status="pending",
                    is_ai_recommended=True
                )
                detail = ActivityDetail(
                    id=uuid.uuid4(),
                    activity_id=act_id,
                    required_water_liters=water_liters,
                    day_offset=day_offset,
                    how_to_instructions=f"Apply deep irrigation during early morning (6:00-8:30 AM) or late afternoon. Ensure moisture penetrates 15-25cm into the root zone without causing surface pooling or soil erosion."
                )
                activities_to_add.append(act)
                details_to_add.append(detail)

            # ── B. FERTILIZER APPLICATION ────────────────────────────────
            if day_offset == start_day_scaled + 2:
                for f_rec in stage_ferts:
                    rate_per_acre = float(f_rec.application_rate_per_acre_kg)
                    total_kg = round(rate_per_acre * area_acres, 2)

                    act_id = uuid.uuid4()
                    act = FarmingActivity(
                        id=act_id,
                        plan_id=plan.id,
                        activity_type="fertilizer",
                        title=f"Apply {f_rec.fertilizer_name} ({stage.stage_name})",
                        description=f"Apply {total_kg} kg of {f_rec.fertilizer_name} ({method.capitalize()} method). {f_rec.instructions or ''}",
                        planned_date=current_date,
                        due_date=current_date + timedelta(days=3),
                        status="pending",
                        is_ai_recommended=True
                    )
                    detail = ActivityDetail(
                        id=uuid.uuid4(),
                        activity_id=act_id,
                        required_fertilizer_kg=total_kg,
                        fertilizer_name=f_rec.fertilizer_name,
                        day_offset=day_offset,
                        how_to_instructions=f_rec.instructions or f"Broadcast or band-apply {total_kg} kg of {f_rec.fertilizer_name} in a circular ring 15-20cm away from plant stems. Lightly incorporate into the soil and irrigate immediately for optimal absorption."
                    )
                    activities_to_add.append(act)
                    details_to_add.append(detail)

            # ── C. PRUNING & CANOPY MANAGEMENT ───────────────────────────
            for prune in pruning_guides:
                prune_start_day = start_day_scaled + int(prune.trigger_day * scale_factor)
                should_prune = False

                if prune.frequency_days > 0:
                    freq_scaled = max(1, int(prune.frequency_days * scale_factor))
                    if day_offset >= prune_start_day and (day_offset - prune_start_day) % freq_scaled == 0:
                        should_prune = True
                elif day_offset == prune_start_day:
                    should_prune = True

                if should_prune:
                    due_days = 1 if prune.importance == "critical" else 3
                    prune_title = f"Pruning — {prune.pruning_type.replace('_', ' ').title()} ({stage.stage_name})"
                    
                    full_instructions = prune.pruning_method
                    if prune.pre_pruning:
                        full_instructions += f" Pre-care: {prune.pre_pruning}"
                    if prune.post_pruning:
                        full_instructions += f" Post-care: {prune.post_pruning}"

                    act_id = uuid.uuid4()
                    act = FarmingActivity(
                        id=act_id,
                        plan_id=plan.id,
                        activity_type="pruning",
                        title=prune_title,
                        description=prune.pruning_method[:250],
                        planned_date=current_date,
                        due_date=current_date + timedelta(days=due_days),
                        status="pending",
                        is_ai_recommended=True
                    )
                    detail = ActivityDetail(
                        id=uuid.uuid4(),
                        activity_id=act_id,
                        pruning_type=prune.pruning_type,
                        pruning_level=prune.importance,
                        tools_needed=prune.tools_needed or "Bypass secateurs, 70% isopropyl alcohol, pruning saw, protective gloves",
                        how_to_instructions=full_instructions,
                        pre_pruning_care=prune.pre_pruning,
                        post_pruning_care=prune.post_pruning,
                        day_offset=day_offset
                    )
                    activities_to_add.append(act)
                    details_to_add.append(detail)

            # ── D. PEST CONTROL & DISEASE SCOUTING ────────────────────────
            # Generate preventive or IPM pest control every 14 days
            if day_offset > 0 and day_offset % 14 == 0 and plant_diseases:
                target_dis = plant_diseases[(day_offset // 14) % len(plant_diseases)]
                
                # Fetch solution
                sol_res = await db.execute(
                    select(DiseaseSolution).where(
                        DiseaseSolution.disease_id == target_dis.id,
                        DiseaseSolution.farming_method == method
                    )
                )
                solution = sol_res.scalars().first()
                if not solution:
                    sol_res = await db.execute(select(DiseaseSolution).where(DiseaseSolution.disease_id == target_dis.id))
                    solution = sol_res.scalars().first()

                treatment = solution.treatment_name if solution else "Neem Oil 5ml/L + Organic Bio-fungicide"
                dosage = solution.dosage if solution else "5 ml per liter of water"
                safety_days = 3 if method == "organic" else 7

                act_id = uuid.uuid4()
                act = FarmingActivity(
                    id=act_id,
                    plan_id=plan.id,
                    activity_type="pest_control",
                    title=f"Pest & Disease Control ({stage.stage_name})",
                    description=f"Scout for {target_dis.name}. Apply preventive spray: {treatment} at {dosage}.",
                    planned_date=current_date,
                    due_date=current_date + timedelta(days=2),
                    status="pending",
                    is_ai_recommended=True
                )
                detail = ActivityDetail(
                    id=uuid.uuid4(),
                    activity_id=act_id,
                    target_pest_disease=target_dis.name,
                    treatment_name=treatment,
                    dosage=dosage,
                    application_method="Foliar spray with fine mist covering upper and underside of leaves",
                    safety_interval_days=safety_days,
                    day_offset=day_offset,
                    how_to_instructions=f"Inspect leaves and stem bases for symptoms of {target_dis.name} ({', '.join(target_dis.symptoms[:3])}). Prepare spray solution using {treatment} at {dosage}. Spray in the early morning or evening when wind speed is under 10 km/h. Ensure thorough coverage of both leaf surfaces."
                )
                activities_to_add.append(act)
                details_to_add.append(detail)

            # ── E. ROUTINE FIELD MONITORING ──────────────────────────────
            if day_offset % 7 == 0:
                watch_desc = stage.watch_for or "General canopy health, leaf color, weed emergence, and soil moisture."
                act_id = uuid.uuid4()
                act = FarmingActivity(
                    id=act_id,
                    plan_id=plan.id,
                    activity_type="monitoring",
                    title=f"Crop Health Scouting ({stage.stage_name})",
                    description=f"Field inspection. Key focus: {watch_desc}",
                    planned_date=current_date,
                    due_date=current_date,
                    status="pending",
                    is_ai_recommended=True
                )
                detail = ActivityDetail(
                    id=uuid.uuid4(),
                    activity_id=act_id,
                    day_offset=day_offset,
                    how_to_instructions=f"Walk diagonally across the field in a 'W' or 'Z' pattern. Closely inspect 10-15 random plants for signs of nutrient deficiency, pest oviposition, and soil compaction. {stage.critical_actions or ''}"
                )
                activities_to_add.append(act)
                details_to_add.append(detail)

        # ── F. HARVESTING (on final stage) ───────────────────────────────
        if stage_idx == len(stages) - 1:
            harvest_date = planting_date + timedelta(days=end_day_scaled)
            act_id = uuid.uuid4()
            act = FarmingActivity(
                id=act_id,
                plan_id=plan.id,
                activity_type="harvesting",
                title=f"Harvest — Final Maturity ({plant.common_name})",
                description=f"Conduct primary harvest for {plant.common_name}. Expected yield: ~{variety.expected_yield_per_acre_kg if variety else 1000} kg/acre.",
                planned_date=harvest_date,
                due_date=harvest_date + timedelta(days=3),
                status="pending",
                is_ai_recommended=True
            )
            detail = ActivityDetail(
                id=uuid.uuid4(),
                activity_id=act_id,
                day_offset=end_day_scaled,
                how_to_instructions=f"Harvest early in the morning when ambient temperatures are cool. Use clean, sharp knives or secateurs. Avoid dropping or bruising produce. Sort and grade produce in a shaded shed before transport to market."
            )
            activities_to_add.append(act)
            details_to_add.append(detail)

    db.add_all(activities_to_add)
    db.add_all(details_to_add)

    project.plan_generation_status = "completed"
    project.status = "active"

    await db.flush()
    logger.info(f"Generated {len(activities_to_add)} activities and {len(details_to_add)} details for project {project_id}.")
    return len(activities_to_add)
