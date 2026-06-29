from pydantic import BaseModel, Field
from typing import Optional, List
import uuid

class FarmerProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    preferred_language: Optional[str] = "en"
    experience_years: Optional[int] = None
    
class FarmerProfileResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    preferred_language: str
    experience_years: Optional[int] = None

class LocationCreate(BaseModel):
    name: str
    address: Optional[str] = None
    district: str
    latitude: float
    longitude: float
    is_primary: bool = False

class LocationResponse(BaseModel):
    id: uuid.UUID
    name: str
    address: Optional[str]
    district: str
    latitude: float
    longitude: float
    is_primary: bool

class LandDetailCreate(BaseModel):
    location_id: uuid.UUID
    total_area: float
    area_unit: str = "acres"
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

class LandDetailResponse(BaseModel):
    id: uuid.UUID
    location_id: uuid.UUID
    total_area: float
    area_unit: str
    soil_type: Optional[str]
    irrigation_type: Optional[str]
