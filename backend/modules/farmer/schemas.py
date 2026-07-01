from pydantic import BaseModel, Field
from typing import Optional, List
import uuid

class FarmerProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    preferred_language: Optional[str] = "en"
    experience_years: Optional[int] = None
    farming_method: Optional[str] = None
    
class FarmerProfileResponse(BaseModel):
    account_id: uuid.UUID
    full_name: str
    primary_language: str
    experience_years: int
    farming_method: str

class LocationCreate(BaseModel):
    label: str
    district: str
    province: Optional[str] = None
    latitude: float
    longitude: float
    is_primary: bool = False

class LocationResponse(BaseModel):
    id: uuid.UUID
    label: str
    district: str
    province: Optional[str]
    latitude: float
    longitude: float
    is_primary: bool

class LandDetailCreate(BaseModel):
    location_id: uuid.UUID
    total_area: float
    area_unit: str = "acres"
    soil_type: Optional[str] = None
    water_source: Optional[str] = None
    irrigation_type: Optional[str] = None

class LandDetailResponse(BaseModel):
    id: uuid.UUID
    location_id: uuid.UUID
    total_area: float
    area_unit: str
    soil_type: Optional[str]
    water_source: Optional[str]
    irrigation_type: Optional[str]
