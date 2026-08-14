"""Project context builder — Method B (the AI / RAG payload).

Assembles everything the AI layer (or a future local-LLM RAG) needs to know
about a project into one structured dict. Three verbosity modes:

  • "full"    — ~2-3k token JSON for Gemini chat (default)
  • "compact" — minimal version for rate-limited calls
  • "rag"     — chunk-friendly structure for future vector DB ingestion

Each section is gathered independently and tolerates partial data so a
project without a soil test, weather cache, etc. still produces a usable
payload rather than failing.
"""
from __future__ import annotations

import logging
import uuid
from datetime import date, timedelta
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from models.project import Project
from models.plant import Plant, PlantVariety, PlantStage
from models.activity import ActivityPlan, FarmingActivity
from models.soil import SoilTest, SoilNutrientResult
from models.weather import WeatherAlert
from models.issue import ProjectIssue
from models.farmer import FarmerLocation, FarmerLandDetail

from modules.agronomy.nutrient_engine import calculate_stage_needs, needs_to_dict
from modules.agronomy.product_matcher import recommend_products

logger = logging.getLogger(__name__)


async def build_project_context(
    db: AsyncSession,
    project_id: uuid.UUID,
    *,
    mode: str = "full",
    intent: str = "general",
) -> dict[str, Any]:
    """Top-level builder. Returns a JSON-safe dict.

    When *intent* is provided (and is not ``"general"``), only the context
    sections relevant to that intent are gathered — saving DB queries and
    reducing the token payload sent to Gemini.
    """
    import asyncio
    from modules.ai.prompts import INTENT_CONTEXT_SECTIONS

    project = await db.get(Project, project_id)
    if not project:
        return {"error": "project_not_found", "project_id": str(project_id)}

    plant = await db.get(Plant, project.plant_id)
    variety = await db.get(PlantVariety, project.variety_id) if project.variety_id else None

    # Determine which sections are needed for this intent.
    # None means "all sections" (general / unrecognised intent).
    needed = INTENT_CONTEXT_SECTIONS.get(intent)

    def _want(section_name: str) -> bool:
        """Return True if this section should be included."""
        return needed is None or section_name in needed

    # Compute nutrient needs — only if the intent actually uses them.
    needs = None
    needs_dict = None
    if _want("nutrient_needs") or _want("product_recommendations"):
        try:
            needs = await calculate_stage_needs(db, project, include_all_stages=(mode == "full"))
            needs_dict = needs_to_dict(needs)
        except Exception:
            logger.exception("nutrient_engine failed for project %s", project_id)

    products = None
    if _want("product_recommendations") and needs:
        try:
            products = await recommend_products(db, needs, project.farming_method, stage="current")
        except Exception:
            logger.exception("product_matcher failed for project %s", project_id)

    # Build only the sections that this intent requires.
    # crop & stage are always included (tiny and universally useful).
    coros = [
        _build_crop_section(project, plant, variety),
        _build_stage_section(db, project),
    ]
    section_keys = ["crop", "stage"]

    optional_sections = [
        ("soil",       _build_soil_section(db, project_id)),
        ("activities", _build_activities_section(db, project_id)),
        ("issues",     _build_issues_section(db, project_id)),
        ("weather",    _build_weather_section(db, project_id, project)),
        ("market",     _build_market_section(db, project)),
        ("land",       _build_land_section(db, project)),
    ]
    for key, coro in optional_sections:
        if _want(key):
            coros.append(coro)
            section_keys.append(key)

    results = await asyncio.gather(*coros, return_exceptions=True)

    # Replace any section that errored with a minimal placeholder.
    def _safe(section, name):
        if isinstance(section, Exception):
            logger.warning("context section %s failed: %s", name, section)
            return {"error": name + "_unavailable"}
        return section

    context: dict[str, Any] = {"project_id": str(project_id)}
    for key, result in zip(section_keys, results):
        context[key] = _safe(result, key)

    if needs_dict is not None and _want("nutrient_needs"):
        context["nutrient_needs"] = needs_dict
    if products is not None and _want("product_recommendations"):
        context["product_recommendations"] = products

    if mode == "compact":
        return _compact(context)
    if mode == "rag":
        return _rag_chunks(context)
    return context


# ── Section builders ────────────────────────────────────────────────────
async def _build_crop_section(project: Project, plant: Plant | None, variety: PlantVariety | None) -> dict:
    return {
        "name": plant.common_name if plant else "Unknown",
        "scientific_name": (variety.scientific_name if variety and variety.scientific_name else None),
        "variety": variety.variety_name if variety else None,
        "category": plant.category if plant else None,
        "farming_method": project.farming_method,
        "area": f"{float(project.area)} {project.area_unit}",
        "planting_date": project.planting_date.isoformat() if project.planting_date else None,
        "expected_harvest_date": project.expected_harvest_date.isoformat() if project.expected_harvest_date else None,
        "status": project.status,
    }


async def _build_stage_section(db: AsyncSession, project: Project) -> dict:
    res = await db.execute(
        select(PlantStage)
        .where(PlantStage.plant_id == project.plant_id)
        .order_by(PlantStage.stage_order)
    )
    stages = list(res.scalars().all())
    days_since_planting = (date.today() - project.planting_date).days if project.planting_date else 0
    current = None
    for s in stages:
        if s.start_day <= days_since_planting <= s.end_day:
            current = s
            break
    total_days = (stages[-1].end_day if stages else 0)
    return {
        "current_stage": current.stage_name if current else None,
        "current_stage_order": current.stage_order if current else None,
        "days_since_planting": days_since_planting,
        "total_growth_days": total_days,
        "progress_pct": round((days_since_planting / total_days) * 100, 1) if total_days else 0,
        "days_to_harvest": max(0, total_days - days_since_planting) if total_days else None,
        "watch_for": current.watch_for if current else None,
        "critical_actions": current.critical_actions if current else None,
    }


async def _build_soil_section(db: AsyncSession, project_id: uuid.UUID) -> dict:
    test_res = await db.execute(
        select(SoilTest)
        .where(SoilTest.project_id == project_id)
        .order_by(SoilTest.created_at.desc(), SoilTest.test_date.desc())
        .limit(1)
    )
    test = test_res.scalars().first()
    if not test:
        return {"has_test": False}

    nut_res = await db.execute(
        select(SoilNutrientResult).where(SoilNutrientResult.soil_test_id == test.id)
    )
    nut = nut_res.scalars().first()

    nutrients = {}
    if nut:
        for code in [
            "ph_level", "electrical_conductivity_ec", "organic_carbon_oc",
            "cation_exchange_capacity_cec", "nitrogen_n", "phosphorus_p",
            "potassium_k", "calcium_ca", "magnesium_mg", "sulfur_s",
            "zinc_zn", "boron_b", "iron_fe", "manganese_mn", "copper_cu",
        ]:
            val = getattr(nut, code, None)
            if val is not None:
                nutrients[code] = float(val)

    return {
        "has_test": True,
        "test_date": test.test_date.isoformat(),
        "tested_by": test.tested_by,
        "nutrients": nutrients,
    }


async def _build_activities_section(db: AsyncSession, project_id: uuid.UUID) -> dict:
    today = date.today()
    plan_res = await db.execute(
        select(ActivityPlan).where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
    )
    plan = plan_res.scalars().first()
    if not plan:
        return {"has_plan": False}

    pending_today = await db.execute(
        select(FarmingActivity).where(
            FarmingActivity.plan_id == plan.id,
            FarmingActivity.planned_date <= today,
            FarmingActivity.status == "pending",
        ).order_by(FarmingActivity.due_date).limit(10)
    )
    upcoming = await db.execute(
        select(FarmingActivity).where(
            FarmingActivity.plan_id == plan.id,
            FarmingActivity.planned_date > today,
            FarmingActivity.planned_date <= today + timedelta(days=7),
            FarmingActivity.status == "pending",
        ).order_by(FarmingActivity.planned_date).limit(10)
    )
    recent_done = await db.execute(
        select(FarmingActivity).where(
            FarmingActivity.plan_id == plan.id,
            FarmingActivity.status == "completed",
        ).order_by(FarmingActivity.completed_at.desc().nullslast()).limit(5)
    )

    def _act(a: FarmingActivity) -> dict:
        return {
            "type": a.activity_type,
            "title": a.title,
            "planned_date": a.planned_date.isoformat() if a.planned_date else None,
            "status": a.status,
        }

    return {
        "has_plan": True,
        "pending_today": [_act(a) for a in pending_today.scalars().all()],
        "upcoming_7_days": [_act(a) for a in upcoming.scalars().all()],
        "recent_completed": [_act(a) for a in recent_done.scalars().all()],
    }


async def _build_issues_section(db: AsyncSession, project_id: uuid.UUID) -> dict:
    res = await db.execute(
        select(ProjectIssue)
        .where(ProjectIssue.project_id == project_id, ProjectIssue.status != "resolved")
        .order_by(ProjectIssue.reported_date.desc())
        .limit(10)
    )
    issues = res.scalars().all()
    return {
        "active_count": len(issues),
        "issues": [
            {
                "type": i.issue_type,
                "title": i.title,
                "severity": i.severity,
                "status": i.status,
                "reported_date": i.reported_date.isoformat() if i.reported_date else None,
                "description": i.description,
            }
            for i in issues
        ],
    }


async def _build_weather_section(db: AsyncSession, project_id: uuid.UUID, project: Project) -> dict:
    # Weather forecast (best-effort; service may raise if location missing).
    forecast_summary = None
    try:
        from dependencies import get_weather_service
        weather = await get_weather_service().get_weather_for_project(db, project_id, project.farmer_id)
        if weather and weather.forecast:
            next_7 = weather.forecast[:7]
            avg_temp = sum(f.condition.temp_celsius for f in next_7) / len(next_7) if next_7 else None
            total_rain = sum(f.condition.rain_mm for f in next_7)
            forecast_summary = {
                "today_temp_c": weather.current.temp_celsius,
                "today_humidity": weather.current.humidity,
                "today_rain_mm": weather.current.rain_mm,
                "today_description": weather.current.description,
                "next_7_days_avg_temp_c": round(avg_temp, 1) if avg_temp else None,
                "next_7_days_total_rain_mm": round(total_rain, 1),
            }
    except Exception as e:
        logger.warning("weather fetch failed in context builder: %s", e)

    # Active alerts.
    alert_res = await db.execute(
        select(WeatherAlert).where(WeatherAlert.project_id == project_id, WeatherAlert.is_resolved == False)
    )
    alerts = [
        {"type": a.alert_type, "severity": a.severity, "message": a.message, "target_date": a.target_date.isoformat()}
        for a in alert_res.scalars().all()
    ]
    return {"forecast": forecast_summary, "alerts": alerts}


async def _build_market_section(db: AsyncSession, project: Project) -> dict:
    try:
        from dependencies import get_market_service
        trend = await get_market_service().get_trend(db, project.plant_id)
        return {
            "current_price_per_kg": trend.get("current_price"),
            "currency": "LKR",
            "trend_direction": trend.get("direction"),
            "change_pct": trend.get("change_percentage"),
        }
    except Exception as e:
        logger.warning("market fetch failed in context builder: %s", e)
        return {"error": "market_unavailable"}


async def _build_land_section(db: AsyncSession, project: Project) -> dict:
    land = None
    if project.land_detail_id:
        land = await db.get(FarmerLandDetail, project.land_detail_id)
    location = await db.get(FarmerLocation, project.location_id) if project.location_id else None
    return {
        "soil_type": land.soil_type if land else None,
        "irrigation_type": land.irrigation_type if land else None,
        "district": location.district if location else None,
        "address": location.address if location else None,
    }


# ── Mode transforms ──────────────────────────────────────────────────────
def _compact(ctx: dict[str, Any]) -> dict[str, Any]:
    """Minimal payload — drop lists, keep only essentials for AI comprehension."""
    stage = ctx.get("stage", {}) or {}
    soil = ctx.get("soil", {}) or {}
    issues = ctx.get("issues", {}) or {}
    weather = ctx.get("weather", {}) or {}
    crop = ctx.get("crop", {}) or {}

    soil_ph = (soil.get("nutrients") or {}).get("ph_level") if soil.get("has_test") else None
    return {
        "project_id": ctx.get("project_id"),
        "crop": crop.get("name"),
        "variety": crop.get("variety"),
        "farming_method": crop.get("farming_method"),
        "area": crop.get("area"),
        "current_stage": stage.get("current_stage"),
        "days_since_planting": stage.get("days_since_planting"),
        "days_to_harvest": stage.get("days_to_harvest"),
        "soil_ph": soil_ph,
        "soil_test_done": soil.get("has_test"),
        "active_issues": issues.get("active_count", 0),
        "weather_today": (weather.get("forecast") or {}).get("today_description") if weather else None,
        "weather_alerts": len((weather or {}).get("alerts") or []),
        "pending_activities_today": len((ctx.get("activities", {}) or {}).get("pending_today") or []),
    }


def _rag_chunks(ctx: dict[str, Any]) -> dict[str, Any]:
    """Restructure the payload as discrete, embeddable chunks.

    A future RAG layer can embed each chunk independently and retrieve the
    most relevant ones for a given user question, instead of always sending
    the whole context.
    """
    chunks = []

    def add(chunk_id: str, text: str, data: dict):
        chunks.append({"id": chunk_id, "text": text, "data": data})

    crop = ctx.get("crop", {}) or {}
    add("crop_profile",
        f"Crop: {crop.get('name')} (variety {crop.get('variety')}); method {crop.get('farming_method')}; area {crop.get('area')}.",
        crop)

    stage = ctx.get("stage", {}) or {}
    add("current_stage",
        f"Stage: {stage.get('current_stage')} (day {stage.get('days_since_planting')} of {stage.get('total_growth_days')}, {stage.get('days_to_harvest')} days to harvest).",
        stage)

    soil = ctx.get("soil", {}) or {}
    if soil.get("has_test"):
        n = soil.get("nutrients") or {}
        add("soil_test",
            f"Latest soil test ({soil.get('test_date')}): pH {n.get('ph_level')}, N {n.get('nitrogen_n')} ppm, P {n.get('phosphorus_p')} ppm, K {n.get('potassium_k')} ppm.",
            soil)

    needs = ctx.get("nutrient_needs")
    if needs:
        cur = (needs.get("current_stage") or {}).get("nutrients") or []
        defs = [n for n in cur if n.get("status") in ("deficient", "low")]
        if defs:
            text = "Current-stage nutrient deficits: " + ", ".join(
                f"{n['name']} ({n['status']}, deficit {n.get('deficit_kg')} kg)" for n in defs
            )
            add("nutrient_needs", text, {"deficits": defs})

    products = ctx.get("product_recommendations")
    if products and products.get("recommendations"):
        text_parts = []
        for r in products["recommendations"]:
            prods = ", ".join(p["name"] for p in r["products"][:2])
            text_parts.append(f"{r['nutrient_name']}: {prods}")
        add("product_recommendations", "Recommended products — " + "; ".join(text_parts), products)

    issues = ctx.get("issues", {}) or {}
    if issues.get("active_count"):
        add("active_issues",
            f"{issues['active_count']} active issue(s): " + ", ".join(i["title"] for i in issues["issues"][:5]),
            issues)

    acts = ctx.get("activities", {}) or {}
    pending = acts.get("pending_today") or []
    if pending:
        add("today_activities",
            "Pending today: " + ", ".join(a["title"] for a in pending),
            acts)

    weather = ctx.get("weather", {}) or {}
    fc = weather.get("forecast") or {}
    if fc:
        add("weather", f"Weather: {fc.get('today_description')}, {fc.get('today_temp_c')}°C, rain {fc.get('today_rain_mm')}mm.",
            weather)

    market = ctx.get("market", {}) or {}
    if market.get("current_price_per_kg"):
        add("market", f"Market price {market.get('current_price_per_kg')} {market.get('currency')} ({market.get('trend_direction')}).",
            market)

    return {
        "project_id": ctx.get("project_id"),
        "chunk_count": len(chunks),
        "chunks": chunks,
    }
