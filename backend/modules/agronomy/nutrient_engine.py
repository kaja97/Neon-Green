"""Stage-aware Nutrient Need Engine (Method A core).

Computes, for the project's *current* growth stage:
  • how much of each nutrient the crop needs (from PlantNutrientReq)
  • how much is already available in the soil (from the latest SoilNutrientResult)
  • the deficit / surplus and a human-readable status

And the season-wide totals (sum across all stages) for the "overall needs" view.

Agronomic assumptions are coded as named constants at the top of the file so
they are tunable and obvious. ppm → kg conversion uses a standard soil-mass
formula based on sampling depth and bulk density.
"""
from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field
from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.project import Project
from models.plant import Plant, PlantStage, PlantNutrientReq
from models.soil import SoilTest, SoilNutrientResult
from modules.soil.calculator import OPTIMAL_RANGES

logger = logging.getLogger(__name__)


# ── Agronomic conversion constants ────────────────────────────────────────
# Soil mass in the root-zone slice we assume nutrients are drawn from.
SOIL_DEPTH_CM: float = 15.0          # effective sampling/rooting depth
SOIL_BULK_DENSITY: float = 1.3       # g/cm³ (typical loam topsoil)
HECTARE_M2: float = 10_000.0         # 1 ha in m²
ACRE_M2: float = 4_046.86            # 1 acre in m²
# kg of soil under 1 hectare at SOIL_DEPTH_CM / SOIL_BULK_DENSITY:
#   10_000 m² × 0.15 m × 1300 kg/m³ = 1_950_000 kg
SOIL_MASS_KG_PER_HA: float = HECTARE_M2 * (SOIL_DEPTH_CM / 100.0) * (SOIL_BULK_DENSITY * 1000.0)
# 1 ppm = 1 mg/kg → kg/ha factor:
PPM_TO_KG_PER_HA: float = SOIL_MASS_KG_PER_HA / 1_000_000.0   # = 1.95
# kg/ha → kg/acre (1 ha = 2.471 acres)
HA_TO_ACRE: float = HECTARE_M2 / ACRE_M2                        # ≈ 2.471
PPM_TO_KG_PER_ACRE: float = PPM_TO_KG_PER_HA / HA_TO_ACRE       # ≈ 0.789

# Status thresholds (fractions of the per-stage target requirement).
DEFICIENT_THRESHOLD: float = 0.5    # <50% of target → deficient
LOW_THRESHOLD: float = 0.9          # 50–90% of target → low
# 90–110% → optimal; >110% → excess


# ── PlantNutrientReq attribute → nutrient_code mapping ───────────────────
# Bridges the per-stage requirement columns to the soil-test attribute keys
# and the ProductNutrientContent.nutrient_code values.
PLANT_REQ_TO_CODE = {
    "nitrogen_kg":   ("nitrogen_n",   "Nitrogen"),
    "phosphorus_kg": ("phosphorus_p", "Phosphorus"),
    "potassium_kg":  ("potassium_k",  "Potassium"),
    "calcium_kg":    ("calcium_ca",   "Calcium"),
    "magnesium_kg":  ("magnesium_mg", "Magnesium"),
}


# ── Internal data classes ────────────────────────────────────────────────
@dataclass
class NutrientStatus:
    code: str                  # nitrogen_n, phosphorus_p, ...
    name: str                  # Nitrogen, Phosphorus, ...
    required_kg: float | None  # stage target (None if no plant-req data)
    available_kg: float | None # soil-derived (None if not tested)
    deficit_kg: float | None   # required − available (positive = short)
    status: str                # deficient | low | optimal | excess | untested | unknown
    soil_ppm: float | None
    optimal_range: dict | None # {"min": x, "max": y}


@dataclass
class StageNeeds:
    stage: PlantStage | None
    stage_name: str
    is_current: bool
    days_since_planting: int
    nutrients: list[NutrientStatus] = field(default_factory=list)


@dataclass
class SeasonNeeds:
    current_stage: StageNeeds
    all_stages: list[StageNeeds]
    season_totals: dict[str, float]   # code → total required_kg across stages


# ── Helpers ──────────────────────────────────────────────────────────────
def _to_float(value) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _area_in_acres(project: Project) -> float:
    area = float(project.area or 1.0)
    if (project.area_unit or "acres").lower() in ("ha", "hectare", "hectares"):
        return area * HA_TO_ACRE
    return area


def _ppm_to_kg_per_acre(ppm: float) -> float:
    return ppm * PPM_TO_KG_PER_ACRE


def _classify(required_kg: float | None, available_kg: float | None) -> str:
    """Classify a nutrient's status relative to its target."""
    if available_kg is None:
        return "untested"
    if required_kg is None or required_kg == 0:
        # No plant-requirement target — fall back to optimal-range check done by caller.
        return "unknown"
    ratio = available_kg / required_kg
    if ratio < DEFICIENT_THRESHOLD:
        return "deficient"
    if ratio < LOW_THRESHOLD:
        return "low"
    if ratio > 1.10:
        return "excess"
    return "optimal"


# ── DB fetch helpers ─────────────────────────────────────────────────────
async def _fetch_stages(db: AsyncSession, plant_id: uuid.UUID) -> list[PlantStage]:
    res = await db.execute(
        select(PlantStage)
        .where(PlantStage.plant_id == plant_id)
        .order_by(PlantStage.stage_order)
    )
    return list(res.scalars().all())


async def _fetch_stage_req(db: AsyncSession, stage_id: uuid.UUID) -> PlantNutrientReq | None:
    res = await db.execute(
        select(PlantNutrientReq).where(PlantNutrientReq.plant_stage_id == stage_id)
    )
    return res.scalars().first()


async def _fetch_latest_soil_result(
    db: AsyncSession, project_id: uuid.UUID
) -> tuple[SoilTest | None, SoilNutrientResult | None]:
    test_res = await db.execute(
        select(SoilTest)
        .where(SoilTest.project_id == project_id)
        .order_by(SoilTest.test_date.desc())
        .limit(1)
    )
    test = test_res.scalars().first()
    if not test:
        return None, None
    nut_res = await db.execute(
        select(SoilNutrientResult).where(SoilNutrientResult.soil_test_id == test.id)
    )
    return test, nut_res.scalars().first()


def _current_stage_index(stages: list[PlantStage], days_since_planting: int) -> int:
    for i, s in enumerate(stages):
        if s.start_day <= days_since_planting <= s.end_day:
            return i
    # Past the last stage → return -1 (crop should be harvested)
    if stages and days_since_planting > stages[-1].end_day:
        return -1
    return 0


# ── Core engine ──────────────────────────────────────────────────────────
async def calculate_stage_needs(
    db: AsyncSession,
    project: Project,
    *,
    include_all_stages: bool = True,
) -> SeasonNeeds:
    """Compute stage-aware nutrient needs for a project.

    Returns the current stage's needs plus (optionally) every stage's needs
    and season totals. Pure data-in / data-out — no side effects.
    """
    area_acres = _area_in_acres(project)
    days_since_planting = (date.today() - project.planting_date).days if project.planting_date else 0

    stages = await _fetch_stages(db, project.plant_id)
    if not stages:
        logger.warning("No plant_stages for plant %s; returning empty needs.", project.plant_id)

    _, soil_result = await _fetch_latest_soil_result(db, project.id)

    current_idx = _current_stage_index(stages, days_since_planting)
    target_indices: list[int]
    if include_all_stages and stages:
        target_indices = list(range(len(stages)))
    elif current_idx >= 0:
        target_indices = [current_idx]
    else:
        target_indices = [0] if stages else []

    all_stage_needs: list[StageNeeds] = []
    season_totals: dict[str, float] = {}

    for idx in target_indices:
        stage = stages[idx]
        req = await _fetch_stage_req(db, stage.id)
        stage_needs = _build_stage_need(
            stage=stage,
            is_current=(idx == current_idx),
            days_since_planting=days_since_planting,
            req=req,
            soil_result=soil_result,
            area_acres=area_acres,
        )
        all_stage_needs.append(stage_needs)
        for n in stage_needs.nutrients:
            if n.required_kg:
                season_totals[n.code] = season_totals.get(n.code, 0.0) + n.required_kg

    # current_stage = the matching StageNeeds, or fall back to first/all empty
    current_stage_needs: StageNeeds
    if current_idx >= 0 and current_idx < len(all_stage_needs):
        current_stage_needs = all_stage_needs[current_idx]
    elif all_stage_needs:
        current_stage_needs = all_stage_needs[0]
    else:
        current_stage_needs = StageNeeds(
            stage=None,
            stage_name="Unknown",
            is_current=True,
            days_since_planting=days_since_planting,
        )

    return SeasonNeeds(
        current_stage=current_stage_needs,
        all_stages=all_stage_needs,
        season_totals=season_totals,
    )


def _build_stage_need(
    *,
    stage: PlantStage,
    is_current: bool,
    days_since_planting: int,
    req: PlantNutrientReq | None,
    soil_result: SoilNutrientResult | None,
    area_acres: float,
) -> StageNeeds:
    needs = StageNeeds(
        stage=stage,
        stage_name=stage.stage_name,
        is_current=is_current,
        days_since_planting=days_since_planting,
    )

    # 1) Nutrients with explicit per-stage plant requirement.
    for attr, (code, name) in PLANT_REQ_TO_CODE.items():
        required_per_acre = _to_float(getattr(req, attr, None)) if req else None
        required_kg = (required_per_acre * area_acres) if required_per_acre is not None else None

        soil_ppm = _to_float(getattr(soil_result, code, None)) if soil_result else None
        available_kg = _ppm_to_kg_per_acre(soil_ppm) * area_acres if soil_ppm is not None else None

        status = _classify(required_kg, available_kg)
        deficit = (required_kg - available_kg) if (required_kg and available_kg) else None

        needs.nutrients.append(NutrientStatus(
            code=code, name=name,
            required_kg=round(required_kg, 2) if required_kg is not None else None,
            available_kg=round(available_kg, 2) if available_kg is not None else None,
            deficit_kg=round(deficit, 2) if deficit is not None and deficit > 0 else 0.0,
            status=status,
            soil_ppm=soil_ppm,
            optimal_range=OPTIMAL_RANGES.get(code),
        ))

    # 2) Nutrients WITHOUT per-stage plant data — use OPTIMAL_RANGES as target.
    plant_req_codes = {c for c, _ in PLANT_REQ_TO_CODE.values()}
    for code, optimal in OPTIMAL_RANGES.items():
        if code in plant_req_codes:
            continue  # already handled above
        name = code.replace("_", " ").title()

        soil_ppm = _to_float(getattr(soil_result, code, None)) if soil_result else None
        if soil_ppm is None:
            available_kg = None
            status = "untested"
        else:
            available_kg = _ppm_to_kg_per_acre(soil_ppm) * area_acres
            # Target band expressed as kg/acre from the optimal ppm range.
            target_min = _ppm_to_kg_per_acre(optimal["min"]) * area_acres
            target_max = _ppm_to_kg_per_acre(optimal["max"]) * area_acres
            if soil_ppm < optimal["min"]:
                status = "deficient"
                deficit = target_min - available_kg
            elif soil_ppm > optimal["max"]:
                status = "excess"
                deficit = 0.0
            else:
                status = "optimal"
                deficit = 0.0

        required_kg = (
            round(_ppm_to_kg_per_acre(optimal["min"]) * area_acres, 2)
            if soil_result is not None else None
        )

        needs.nutrients.append(NutrientStatus(
            code=code, name=name,
            required_kg=required_kg,
            available_kg=round(available_kg, 2) if available_kg is not None else None,
            deficit_kg=round(deficit, 2) if (soil_ppm is not None and deficit > 0) else 0.0,
            status=status,
            soil_ppm=soil_ppm,
            optimal_range=optimal,
        ))

    return needs


def needs_to_dict(needs: SeasonNeeds) -> dict:
    """Serialize a SeasonNeeds result to a JSON-safe dict (for API / AI payload)."""
    def stage_to_dict(s: StageNeeds) -> dict:
        return {
            "stage_name": s.stage_name,
            "is_current": s.is_current,
            "start_day": s.stage.start_day if s.stage else None,
            "end_day": s.stage.end_day if s.stage else None,
            "days_since_planting": s.days_since_planting,
            "nutrients": [
                {
                    "code": n.code,
                    "name": n.name,
                    "required_kg": n.required_kg,
                    "available_kg": n.available_kg,
                    "deficit_kg": n.deficit_kg,
                    "status": n.status,
                    "soil_ppm": n.soil_ppm,
                    "optimal_range_ppm": n.optimal_range,
                }
                for n in s.nutrients
            ],
        }
    return {
        "current_stage": stage_to_dict(needs.current_stage),
        "all_stages": [stage_to_dict(s) for s in needs.all_stages],
        "season_totals_kg": {k: round(v, 2) for k, v in needs.season_totals.items()},
    }
