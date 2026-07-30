"""AI context builder — thin delegation to the agronomy module.

The agronomy module is now the authoritative context/data provider.
This function keeps the same signature (db, project_id → JSON str)
so ``ai/service.py`` and ``tasks/ai_tasks.py`` work unchanged.
The richer payload (nutrient needs, product recommendations, weather,
market, issues, land) gives Gemini noticeably better answers.
"""
import json
import uuid
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from .prompts import INTENT_CONTEXT_SECTIONS

logger = logging.getLogger(__name__)


async def build_project_context(
    db: AsyncSession,
    project_id: uuid.UUID,
    *,
    intent: str = "general",
) -> str:
    """Flatten project state into structured JSON context for Gemini.

    Delegates to the agronomy module's context builder (full mode).
    When an intent is provided, only sections relevant to that intent are
    included — reducing token usage and keeping the AI focused.

    Falls back to a minimal context if the agronomy service is not yet
    available (e.g. migration not yet run).
    """
    try:
        from modules.agronomy.context_builder import build_project_context as _agro_ctx
        context = await _agro_ctx(db, project_id, mode="full", intent=intent)
        if "error" in context:
            logger.warning("Agronomy context returned error for %s: %s", project_id, context["error"])
        return json.dumps(context, indent=2, default=str)
    except Exception as exc:
        logger.warning("Agronomy context builder unavailable for %s, using fallback: %s", project_id, exc)
        return await _fallback_context(db, project_id, intent=intent)


async def _fallback_context(
    db: AsyncSession,
    project_id: uuid.UUID,
    *,
    intent: str = "general",
) -> str:
    """Minimal context — original pre-agronomy logic kept as safety net.

    When an intent is provided, only the relevant keys are included.
    """
    from datetime import date
    from sqlalchemy.future import select
    from models.project import Project
    from models.plant import Plant, PlantStage
    from models.activity import ActivityPlan, FarmingActivity
    from models.soil import SoilTest, SoilNutrientResult

    project = await db.get(Project, project_id)
    if not project:
        return "{}"

    # Determine which sections are needed for this intent
    needed = INTENT_CONTEXT_SECTIONS.get(intent)  # None = all

    plant = await db.get(Plant, project.plant_id)

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

    # Always include basic crop + stage info (tiny, always useful)
    context = {
        "crop": plant.common_name if plant else "Unknown",
        "farming_method": project.farming_method,
        "area": f"{float(project.area)} {project.area_unit}",
        "planting_date": project.planting_date.isoformat(),
        "days_since_planting": days_since_planting,
        "current_stage": current_stage.stage_name if current_stage else "Unknown",
        "status": project.status,
    }

    # Activities — only if needed
    if needed is None or "activities" in needed:
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
        context["pending_activities"] = pending_count

    # Soil — only if needed
    if needed is None or "soil" in needed or "nutrient_needs" in needed:
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
                    "nitrogen_ppm": float(nut.nitrogen_n) if nut.nitrogen_n else None,
                    "phosphorus_ppm": float(nut.phosphorus_p) if nut.phosphorus_p else None,
                    "potassium_ppm": float(nut.potassium_k) if nut.potassium_k else None,
                }
        context["soil"] = soil_info

    return json.dumps(context, indent=2)
