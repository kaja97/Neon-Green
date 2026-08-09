from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List

class AccountRole(str, Enum):
    FARMER = "farmer"
    ADMIN = "admin"
    VENDOR = "vendor"
    BUYER = "buyer"

class AdminRoleUpdate(BaseModel):
    role: AccountRole = Field(..., description="The new role to assign to the user")

# --- Master Data Schemas ---
from datetime import date
from pydantic import ConfigDict
import uuid


class PlantCreate(BaseModel):
    common_name: str
    category: str
    growth_duration_days: int
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    sub_category: Optional[str] = None
    planting_season: Optional[List[str]] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    optimal_rainfall_mm: Optional[float] = None
    optimal_ph_min: Optional[float] = None
    optimal_ph_max: Optional[float] = None
    expected_yield_per_acre_kg: Optional[float] = None
    compatible_soil_types: Optional[List[str]] = None
    description: Optional[str] = None

class PlantUpdate(BaseModel):
    common_name: Optional[str] = None
    category: Optional[str] = None
    growth_duration_days: Optional[int] = None
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    sub_category: Optional[str] = None
    planting_season: Optional[List[str]] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    optimal_rainfall_mm: Optional[float] = None
    optimal_ph_min: Optional[float] = None
    optimal_ph_max: Optional[float] = None
    expected_yield_per_acre_kg: Optional[float] = None
    compatible_soil_types: Optional[List[str]] = None
    description: Optional[str] = None


class DiseaseSolutionInput(BaseModel):
    """Nested solution payload when creating/updating a disease."""
    farming_method: str  # organic, conventional
    solution_type: str   # preventive, curative
    treatment_name: str
    dosage: str
    instructions: str


class DiseaseCreate(BaseModel):
    plant_id: uuid.UUID  # Required — plant_diseases.plant_id is NOT NULL
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
