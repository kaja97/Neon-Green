from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime
import uuid

class SoilNutrientResultCreate(BaseModel):
    # Physical & Chemical Properties
    ph_level: float  # Required, range 1-14
    electrical_conductivity_ec: Optional[float] = None  # ds/m
    organic_carbon_oc: Optional[float] = None  # %
    cation_exchange_capacity_cec: Optional[float] = None  # meq/100g

    # Primary Macronutrients (ppm)
    nitrogen_n: Optional[float] = None
    phosphorus_p: Optional[float] = None
    potassium_k: Optional[float] = None

    # Secondary Macronutrients (ppm)
    calcium_ca: Optional[float] = None
    magnesium_mg: Optional[float] = None
    sulfur_s: Optional[float] = None

    # Micronutrients / Trace Elements (ppm)
    zinc_zn: Optional[float] = None
    boron_b: Optional[float] = None
    iron_fe: Optional[float] = None
    manganese_mn: Optional[float] = None
    copper_cu: Optional[float] = None

class SoilNutrientResultResponse(BaseModel):
    id: uuid.UUID
    # Physical & Chemical Properties
    ph_level: float
    electrical_conductivity_ec: Optional[float] = None
    organic_carbon_oc: Optional[float] = None
    cation_exchange_capacity_cec: Optional[float] = None

    # Primary Macronutrients (ppm)
    nitrogen_n: Optional[float] = None
    phosphorus_p: Optional[float] = None
    potassium_k: Optional[float] = None

    # Secondary Macronutrients (ppm)
    calcium_ca: Optional[float] = None
    magnesium_mg: Optional[float] = None
    sulfur_s: Optional[float] = None

    # Micronutrients / Trace Elements (ppm)
    zinc_zn: Optional[float] = None
    boron_b: Optional[float] = None
    iron_fe: Optional[float] = None
    manganese_mn: Optional[float] = None
    copper_cu: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class SoilTestCreate(BaseModel):
    test_date: date
    tested_by: Optional[str] = None
    notes: Optional[str] = None
    results: SoilNutrientResultCreate

class SoilRecommendationResponse(BaseModel):
    id: uuid.UUID
    recommendation_type: str
    description: str
    is_applied: bool
    applied_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class SoilTestResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    test_date: date
    tested_by: Optional[str]
    status: str
    notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SoilTestDetailResponse(SoilTestResponse):
    results: Optional[SoilNutrientResultResponse] = None
    recommendations: List[SoilRecommendationResponse] = []
