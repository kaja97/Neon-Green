"""Product Matcher — maps nutrient deficits to concrete products.

Given a :class:`SeasonNeeds` (from nutrient_engine) and the project's
farming method, returns structured product recommendations per deficient
nutrient, for the current stage and aggregated for the whole season.

Ranks candidates by:
  1. exact farming-method match (organic project → organic product first)
  2. availability (fast release for acute deficit)
  3. nutrient content efficiency (higher % = less product to haul)
  4. name (stable, alphabetical tie-break)
"""
from __future__ import annotations

import logging
import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from modules.agronomy.nutrient_engine import SeasonNeeds, StageNeeds, NutrientStatus
from modules.agronomy.repository import (
    ProductCatalogRepository,
    ProductNutrientContentRepository,
)
from models.product import ProductCatalog, ProductNutrientContent

logger = logging.getLogger(__name__)


# Treat deficit + low + untested-with-known-target as actionable.
ACTIONABLE_STATUSES = {"deficient", "low"}

AVAILABILITY_RANK = {"fast": 0, "medium": 1, "slow": 2}


async def recommend_products(
    db: AsyncSession,
    needs: SeasonNeeds,
    farming_method: str,
    *,
    stage: str = "current",   # "current" | "overall"
) -> dict:
    """Return product recommendations for the requested scope.

    Output shape (stable across UI / AI consumers):

        {
          "scope": "current" | "overall",
          "farming_method": "organic",
          "recommendations": [
            {
              "nutrient_code": "nitrogen_n",
              "nutrient_name": "Nitrogen",
              "deficit_kg": 12.5,
              "status": "deficient",
              "products": [
                {
                  "product_id": "...",
                  "name": "Urea (46% N)",
                  "product_type": "fertilizer",
                  "farming_method": "inorganic",
                  "npk_ratio": "46-0-0",
                  "content_percentage": 46.0,
                  "recommended_kg": 27.2,
                  "application_rate_per_acre_kg": 50.0,
                  "availability": "fast",
                  "instructions": "..."
                },
                ...
              ],
            },
            ...
          ],
          "summary": "3 nutrients need attention; 5 products suggested."
        }
    """
    catalog_repo = ProductCatalogRepository()
    content_repo = ProductNutrientContentRepository()

    if stage == "overall":
        targets = _overall_targets(needs)
    else:
        targets = _stage_targets(needs.current_stage)

    recommendations = []
    for tgt in targets:
        if tgt.status not in ACTIONABLE_STATUSES or not tgt.deficit_kg or tgt.deficit_kg <= 0:
            continue

        products = await catalog_repo.get_for_nutrient(db, tgt.code, farming_method)
        if not products:
            logger.info("No products in catalog for nutrient %s", tgt.code)
            continue

        product_ids = [p.id for p in products]
        contents = await content_repo.get_for_products(db, product_ids)
        content_by_product: dict[uuid.UUID, list[ProductNutrientContent]] = {}
        for c in contents:
            content_by_product.setdefault(c.product_id, []).append(c)

        ranked = _rank_and_dose(products, content_by_product, tgt.code, tgt.deficit_kg, farming_method)
        if not ranked:
            continue

        recommendations.append({
            "nutrient_code": tgt.code,
            "nutrient_name": tgt.name,
            "deficit_kg": round(tgt.deficit_kg, 2),
            "status": tgt.status,
            "products": ranked,
        })

    return {
        "scope": stage,
        "farming_method": farming_method,
        "recommendations": recommendations,
        "summary": _build_summary(recommendations),
    }


def _stage_targets(stage: StageNeeds) -> list[NutrientStatus]:
    return list(stage.nutrients)


def _overall_targets(needs: SeasonNeeds) -> list[NutrientStatus]:
    """Aggregate per-nutrient deficits across every stage.

    For each nutrient code we sum the deficit_kg across stages; if no stage
    reports a deficit but the current stage flags the nutrient as deficient,
    we still emit it using the current-stage figures so the farmer sees action.
    """
    by_code: dict[str, NutrientStatus] = {}
    for s in needs.all_stages:
        for n in s.nutrients:
            cur = by_code.get(n.code)
            if cur is None:
                by_code[n.code] = NutrientStatus(
                    code=n.code, name=n.name,
                    required_kg=n.required_kg,
                    available_kg=n.available_kg,
                    deficit_kg=(n.deficit_kg or 0.0),
                    status=n.status,
                    soil_ppm=n.soil_ppm,
                    optimal_range=n.optimal_range,
                )
            else:
                cur.deficit_kg = (cur.deficit_kg or 0.0) + (n.deficit_kg or 0.0)
                # Promote to the worst status seen across stages.
                if _status_rank(n.status) < _status_rank(cur.status):
                    cur.status = n.status
    # Promote current_stage status into overall if overall came back "optimal"
    for n in needs.current_stage.nutrients:
        if n.code in by_code and _status_rank(n.status) < _status_rank(by_code[n.code].status):
            by_code[n.code].status = n.status
    return list(by_code.values())


_STATUS_RANK = {"deficient": 0, "low": 1, "untested": 2, "unknown": 3, "optimal": 4, "excess": 5}


def _status_rank(s: str) -> int:
    return _STATUS_RANK.get(s, 3)


def _rank_and_dose(
    products: list[ProductCatalog],
    content_by_product: dict[uuid.UUID, list[ProductNutrientContent]],
    nutrient_code: str,
    deficit_kg: float,
    farming_method: str,
) -> list[dict]:
    out: list[dict] = []
    for p in products:
        contents = content_by_product.get(p.id, [])
        match = next((c for c in contents if c.nutrient_code == nutrient_code), None)
        if match is None or match.content_percentage <= 0:
            continue

        dose_kg = deficit_kg / (float(match.content_percentage) / 100.0)

        out.append({
            "product_id": str(p.id),
            "name": p.name,
            "product_type": p.product_type,
            "farming_method": p.farming_method,
            "npk_ratio": p.npk_ratio,
            "primary_nutrient": p.primary_nutrient,
            "content_percentage": float(match.content_percentage),
            "recommended_kg": round(dose_kg, 2),
            "application_rate_per_acre_kg": float(p.application_rate_per_acre_kg) if p.application_rate_per_acre_kg else None,
            "availability": match.availability,
            "instructions": p.instructions,
            "description": p.description,
        })

    out.sort(key=lambda r: (
        0 if r["farming_method"] == farming_method else 1,           # method match
        AVAILABILITY_RANK.get(r["availability"], 3),                 # faster first
        -(r["content_percentage"]),                                  # higher % first
        r["name"],                                                   # stable tie-break
    ))
    return out


def _build_summary(recommendations: list[dict]) -> str:
    nutrients = len(recommendations)
    products = sum(len(r["products"]) for r in recommendations)
    if nutrients == 0:
        return "No nutrient deficits detected — soil nutrient levels are adequate for this stage."
    return f"{nutrients} nutrient{'s' if nutrients != 1 else ''} need attention; {products} product{'s' if products != 1 else ''} suggested."
