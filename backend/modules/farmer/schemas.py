from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid

class FarmerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    primary_language: Optional[str] = None
    experience_years: Optional[int] = None
    farming_method: Optional[str] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    bio: Optional[str] = None
    
class FarmerProfileResponse(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    full_name: str
    primary_language: str
    experience_years: int
    farming_method: str
    gender: Optional[str] = None
    education_level: Optional[str] = None
    bio: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LocationCreate(BaseModel):
    name: str
    district: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    is_primary: bool = False

class LocationResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    name: str
    district: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)

class LandDetailCreate(BaseModel):
    location_id: uuid.UUID
    total_area: float
    area_unit: str = "acres"
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

class LandDetailResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    location_id: uuid.UUID
    total_area: float
    area_unit: str
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_primary: Optional[bool] = None

class LandDetailUpdate(BaseModel):
    total_area: Optional[float] = None
    area_unit: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
