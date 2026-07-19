import uuid
import json
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.project import Project
from models.plant import Plant, PlantStage
from models.activity import ActivityPlan, FarmingActivity
from models.soil import SoilTest, SoilNutrientResult

async def build_project_context(db: AsyncSession, project_id: uuid.UUID) -> str:
    """Flatten project state into ~2000 token JSON context for Gemini."""
    project = await db.get(Project, project_id)
    if not project:
        return "{}"
    
    plant = await db.get(Plant, project.plant_id)
    
    # Current stage
    stages_res = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == project.plant_id).order_by(PlantStage.stage_order)
    )
    stages = stages_res.scalars().all()
    
    days_since_planting = (date.today() - project.planting_date).days
    current_stage = None
    for s in stages:
        if s.start_day <= days_since_planting <= s.end_day:
            current_stage = s
            break
    
    # Today's activities
    plan_res = await db.execute(
        select(ActivityPlan).where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
    )
    plan = plan_res.scalars().first()
    
    pending_count = 0
    if plan:
        act_res = await db.execute(
            select(FarmingActivity)
            .where(FarmingActivity.plan_id == plan.id, FarmingActivity.status == "pending")
        )
        pending_count = len(act_res.scalars().all())
    
    # Latest soil test
    soil_res = await db.execute(
        select(SoilTest).where(SoilTest.project_id == project_id).order_by(SoilTest.test_date.desc()).limit(1)
    )
    latest_soil = soil_res.scalars().first()
    soil_info = None
    if latest_soil:
        nut_res = await db.execute(
            select(SoilNutrientResult).where(SoilNutrientResult.soil_test_id == latest_soil.id)
        )
        nut = nut_res.scalars().first()
        if nut:
            soil_info = {
                "ph": float(nut.ph_level),
                "ec": float(nut.electrical_conductivity_ec) if nut.electrical_conductivity_ec else None,
                "organic_carbon_pct": float(nut.organic_carbon_oc) if nut.organic_carbon_oc else None,
                "cec": float(nut.cation_exchange_capacity_cec) if nut.cation_exchange_capacity_cec else None,
                "nitrogen_ppm": float(nut.nitrogen_n) if nut.nitrogen_n else None,
                "phosphorus_ppm": float(nut.phosphorus_p) if nut.phosphorus_p else None,
                "potassium_ppm": float(nut.potassium_k) if nut.potassium_k else None,
                "calcium_ppm": float(nut.calcium_ca) if nut.calcium_ca else None,
                "magnesium_ppm": float(nut.magnesium_mg) if nut.magnesium_mg else None,
                "sulfur_ppm": float(nut.sulfur_s) if nut.sulfur_s else None,
                "zinc_ppm": float(nut.zinc_zn) if nut.zinc_zn else None,
                "boron_ppm": float(nut.boron_b) if nut.boron_b else None,
                "iron_ppm": float(nut.iron_fe) if nut.iron_fe else None,
                "manganese_ppm": float(nut.manganese_mn) if nut.manganese_mn else None,
                "copper_ppm": float(nut.copper_cu) if nut.copper_cu else None,
            }
    
    context = {
        "crop": plant.common_name if plant else "Unknown",
        "scientific_name": plant.scientific_name if plant else None,
        "farming_method": project.farming_method,
        "area": f"{float(project.area)} {project.area_unit}",
        "planting_date": project.planting_date.isoformat(),
        "days_since_planting": days_since_planting,
        "current_stage": current_stage.stage_name if current_stage else "Unknown",
        "total_growth_days": plant.growth_duration_days if plant else 0,
        "expected_harvest": project.expected_harvest_date.isoformat() if project.expected_harvest_date else None,
        "pending_activities": pending_count,
        "soil": soil_info,
        "status": project.status
    }
    
    return json.dumps(context, indent=2)
