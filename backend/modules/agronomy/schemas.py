"""Pydantic response schemas for the agronomy module.

These are intentionally loose (many Optional fields) because the engine
degrades gracefully when soil/plant data is partial. A null field signals
"not enough data to compute" rather than an error.
"""
from pydantic import BaseModel, ConfigDict
from typing import Any, Optional
import uuid


# ── Product catalog ──────────────────────────────────────────────────────
class ProductNutrientContentResponse(BaseModel):
    id: uuid.UUID
    nutrient_code: str
    nutrient_name: str
    content_percentage: float
    availability: str

    model_config = ConfigDict(from_attributes=True)


class ProductCatalogResponse(BaseModel):
    id: uuid.UUID
    name: str
    product_type: str
    farming_method: str
    primary_nutrient: Optional[str] = None
    npk_ratio: Optional[str] = None
    application_rate_per_acre_kg: Optional[float] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# ── Nutrient needs (Method A) ────────────────────────────────────────────
class NutrientStatusResponse(BaseModel):
    code: str
    name: str
    required_kg: Optional[float] = None
    available_kg: Optional[float] = None
    deficit_kg: Optional[float] = None
    status: str
    soil_ppm: Optional[float] = None
    optimal_range_ppm: Optional[dict[str, float]] = None


class StageNeedsResponse(BaseModel):
    stage_name: str
    is_current: bool
    start_day: Optional[int] = None
    end_day: Optional[int] = None
    days_since_planting: int
    nutrients: list[NutrientStatusResponse]


class NutrientNeedsResponse(BaseModel):
    project_id: uuid.UUID
    current_stage: StageNeedsResponse
    all_stages: list[StageNeedsResponse]
    season_totals_kg: dict[str, float]


# ── Product recommendations (Method A) ───────────────────────────────────
class RecommendedProductResponse(BaseModel):
    product_id: str
    name: str
    product_type: str
    farming_method: str
    npk_ratio: Optional[str] = None
    primary_nutrient: Optional[str] = None
    content_percentage: float
    recommended_kg: float
    application_rate_per_acre_kg: Optional[float] = None
    availability: str
    instructions: Optional[str] = None
    description: Optional[str] = None


class NutrientProductRecommendationResponse(BaseModel):
    nutrient_code: str
    nutrient_name: str
    deficit_kg: float
    status: str
    products: list[RecommendedProductResponse]


class ProductRecommendationResponse(BaseModel):
    project_id: uuid.UUID
    scope: str  # "current" | "overall"
    farming_method: str
    recommendations: list[NutrientProductRecommendationResponse]
    summary: str


# ── AI / RAG context (Method B) ──────────────────────────────────────────
class ProjectContextResponse(BaseModel):
    """Full structured payload returned to the AI module / future RAG layer."""
    project_id: uuid.UUID
    mode: str
    context: dict[str, Any]
