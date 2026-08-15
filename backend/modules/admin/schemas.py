from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import date, datetime
import uuid


class AccountRole(str, Enum):
    FARMER = "farmer"
    ADMIN = "admin"
    VENDOR = "vendor"
    BUYER = "buyer"


class AdminRoleUpdate(BaseModel):
    role: AccountRole = Field(..., description="The new role to assign to the user")


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


# ─── Master Data: Plant & Varieties ─────────────────────────

class PlantCreate(BaseModel):
    common_name: str
    category: str
    local_name: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True


class PlantUpdate(BaseModel):
    common_name: Optional[str] = None
    category: Optional[str] = None
    local_name: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class PlantVarietyCreate(BaseModel):
    variety_name: str
    growth_duration_days: int
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    planting_season: Optional[List[str]] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    optimal_rainfall_mm: Optional[float] = None
    optimal_ph_min: Optional[float] = None
    optimal_ph_max: Optional[float] = None
    expected_yield_per_acre_kg: Optional[float] = None
    compatible_soil_types: Optional[List[str]] = None
    companion_plants: Optional[List[str]] = None
    incompatible_plants: Optional[List[str]] = None
    is_active: bool = True


class PlantVarietyUpdate(BaseModel):
    variety_name: Optional[str] = None
    growth_duration_days: Optional[int] = None
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    planting_season: Optional[List[str]] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    optimal_rainfall_mm: Optional[float] = None
    optimal_ph_min: Optional[float] = None
    optimal_ph_max: Optional[float] = None
    expected_yield_per_acre_kg: Optional[float] = None
    compatible_soil_types: Optional[List[str]] = None
    companion_plants: Optional[List[str]] = None
    incompatible_plants: Optional[List[str]] = None
    is_active: Optional[bool] = None


class PlantVarietyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_id: uuid.UUID
    variety_name: str
    scientific_name: Optional[str] = None
    growth_duration_days: int
    planting_season: Optional[List[str]] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    optimal_rainfall_mm: Optional[float] = None
    optimal_ph_min: Optional[float] = None
    optimal_ph_max: Optional[float] = None
    expected_yield_per_acre_kg: Optional[float] = None
    compatible_soil_types: Optional[List[str]] = None
    companion_plants: Optional[List[str]] = None
    incompatible_plants: Optional[List[str]] = None
    description: Optional[str] = None
    is_active: bool


# ─── Master Data: Stages, Requirements & Guides ─────────────

class WaterReqInput(BaseModel):
    water_mm_per_day: float
    frequency_days: int
    drought_tolerance: str = "moderate"


class NutrientReqInput(BaseModel):
    nitrogen_kg: float
    phosphorus_kg: float
    potassium_kg: float
    calcium_kg: Optional[float] = None
    magnesium_kg: Optional[float] = None


class PlantStageCreate(BaseModel):
    stage_name: str
    stage_order: int
    start_day: int
    end_day: int
    description: Optional[str] = None
    key_indicators: Optional[str] = None
    critical_actions: Optional[str] = None
    watch_for: Optional[str] = None
    water_req: Optional[WaterReqInput] = None
    nutrient_req: Optional[NutrientReqInput] = None


class PlantStageUpdate(BaseModel):
    stage_name: Optional[str] = None
    stage_order: Optional[int] = None
    start_day: Optional[int] = None
    end_day: Optional[int] = None
    description: Optional[str] = None
    key_indicators: Optional[str] = None
    critical_actions: Optional[str] = None
    watch_for: Optional[str] = None
    water_req: Optional[WaterReqInput] = None
    nutrient_req: Optional[NutrientReqInput] = None


class FertilizerRecommendationCreate(BaseModel):
    farming_method: str  # organic, conventional, integrated
    fertilizer_name: str
    application_rate_per_acre_kg: float
    instructions: Optional[str] = None


class FertilizerRecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_stage_id: uuid.UUID
    farming_method: str
    fertilizer_name: str
    application_rate_per_acre_kg: float
    instructions: Optional[str] = None


class PruningGuideCreate(BaseModel):
    pruning_type: str
    pruning_method: str
    trigger_day: int = 0
    frequency_days: int = 0
    pre_pruning: Optional[str] = None
    post_pruning: Optional[str] = None
    tools_needed: Optional[str] = None
    season_notes: Optional[str] = None
    importance: str = "recommended"


class PruningGuideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_stage_id: uuid.UUID
    pruning_type: str
    pruning_method: str
    trigger_day: int
    frequency_days: int
    pre_pruning: Optional[str] = None
    post_pruning: Optional[str] = None
    tools_needed: Optional[str] = None
    season_notes: Optional[str] = None
    importance: str


class PlantStageDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_id: uuid.UUID
    stage_name: str
    stage_order: int
    start_day: int
    end_day: int
    description: Optional[str] = None
    key_indicators: Optional[str] = None
    critical_actions: Optional[str] = None
    watch_for: Optional[str] = None
    water_req: Optional[dict] = None
    nutrient_req: Optional[dict] = None
    fertilizer_recommendations: List[FertilizerRecommendationResponse] = []
    pruning_guides: List[PruningGuideResponse] = []


# ─── Master Data: Diseases & Health ─────────────────────────

class DiseaseSolutionInput(BaseModel):
    farming_method: str  # organic, conventional, integrated
    solution_type: str   # preventive, curative
    treatment_name: str
    dosage: str
    instructions: str


class DiseaseCreate(BaseModel):
    plant_id: uuid.UUID
    name: str
    symptoms: List[str]
    conditions: List[str]
    severity: str
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    solutions: Optional[List[DiseaseSolutionInput]] = None


class DiseaseUpdate(BaseModel):
    plant_id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    symptoms: Optional[List[str]] = None
    conditions: Optional[List[str]] = None
    severity: Optional[str] = None
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    solutions: Optional[List[DiseaseSolutionInput]] = None


class DiseaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_id: uuid.UUID
    plant_name: Optional[str] = None
    name: str
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    symptoms: List[str]
    conditions: List[str]
    severity: str
    image_url: Optional[str] = None
    solutions: List[dict] = []


# ─── Master Data: Pests & Health ────────────────────────────

class PestSolutionInput(BaseModel):
    farming_method: str  # organic, conventional, integrated
    treatment_name: str
    dosage: str
    instructions: str


class PestCreate(BaseModel):
    plant_id: uuid.UUID
    name: str
    signs: List[str]
    affected_parts: List[str]
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    solutions: Optional[List[PestSolutionInput]] = None


class PestUpdate(BaseModel):
    plant_id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    signs: Optional[List[str]] = None
    affected_parts: Optional[List[str]] = None
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    solutions: Optional[List[PestSolutionInput]] = None


class PestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_id: uuid.UUID
    plant_name: Optional[str] = None
    name: str
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    signs: List[str]
    affected_parts: List[str]
    image_url: Optional[str] = None
    solutions: List[dict] = []


# ─── Field Issues Management ────────────────────────────────

class IssueStatusUpdate(BaseModel):
    status: str  # open, in_progress, resolved
    resolved_date: Optional[date] = None
    ai_diagnosis: Optional[str] = None
    identified_disease_id: Optional[uuid.UUID] = None
    identified_pest_id: Optional[uuid.UUID] = None


class AdminIssueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    project_name: Optional[str] = None
    farmer_name: Optional[str] = None
    crop_name: Optional[str] = None
    issue_type: str
    title: str
    description: Optional[str] = None
    severity: str
    reported_date: date
    status: str
    resolved_date: Optional[date] = None
    is_shared_to_community: bool = False
    images: Optional[List[str]] = None
    ai_diagnosis: Optional[str] = None
    identified_disease_id: Optional[uuid.UUID] = None
    identified_pest_id: Optional[uuid.UUID] = None
