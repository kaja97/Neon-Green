from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime
import uuid

class SoilNutrientResultCreate(BaseModel):
    ph_level: float
    nitrogen_level: str  # Low, Medium, High
    phosphorus_level: str
    potassium_level: str
    organic_matter_perc: Optional[float] = None
    moisture_level: Optional[str] = None

class SoilNutrientResultResponse(BaseModel):
    id: uuid.UUID
    ph_level: float
    nitrogen_level: str
    phosphorus_level: str
    potassium_level: str
    organic_matter_perc: Optional[float]
    moisture_level: Optional[str]

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
    
    # We'll omit full results in the base list response to keep it light, 
    # but we can optionally include them.

    model_config = ConfigDict(from_attributes=True)

class SoilTestDetailResponse(SoilTestResponse):
    results: Optional[SoilNutrientResultResponse]
    recommendations: List[SoilRecommendationResponse]
