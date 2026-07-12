"""Farmer module schemas — profile, locations, land, livestock."""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
import uuid


# ── Profile ──────────────────────────────────────────────

class FarmerProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    primary_language: Optional[str] = Field(None, max_length=10)
    experience_years: Optional[int] = Field(None, ge=0)
    farming_method: Optional[str] = Field(None, max_length=50)
    gender: Optional[str] = Field(None, max_length=20)
    education_level: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=1000)


class FarmerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    account_id: uuid.UUID
    full_name: str
    primary_language: str
    experience_years: int
    farming_method: str
    gender: Optional[str] = None
    education_level: Optional[str] = None
    bio: Optional[str] = None


# ── Location ─────────────────────────────────────────────

class LocationCreate(BaseModel):
    name: str = Field(..., max_length=100)
    district: str = Field(..., max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    is_primary: bool = False


class LocationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    is_primary: Optional[bool] = None


class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    farmer_id: uuid.UUID
    name: str
    district: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_primary: bool


# ── Land Detail ──────────────────────────────────────────

class LandDetailCreate(BaseModel):
    location_id: uuid.UUID
    total_area: float = Field(..., gt=0)
    area_unit: str = Field(default="acres", max_length=20)
    soil_type: Optional[str] = Field(None, max_length=100)
    irrigation_type: Optional[str] = Field(None, max_length=100)


class LandDetailUpdate(BaseModel):
    total_area: Optional[float] = Field(None, gt=0)
    area_unit: Optional[str] = Field(None, max_length=20)
    soil_type: Optional[str] = Field(None, max_length=100)
    irrigation_type: Optional[str] = Field(None, max_length=100)


class LandDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    farmer_id: uuid.UUID
    location_id: uuid.UUID
    total_area: float
    area_unit: str
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None


# ── Livestock ────────────────────────────────────────────

class LivestockCreate(BaseModel):
    animal_type: str = Field(..., max_length=100)
    count: int = Field(..., ge=1)
    purpose: Optional[str] = Field(None, max_length=100)


class LivestockUpdate(BaseModel):
    animal_type: Optional[str] = Field(None, max_length=100)
    count: Optional[int] = Field(None, ge=0)
    purpose: Optional[str] = Field(None, max_length=100)


class LivestockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    farmer_id: uuid.UUID
    animal_type: str
    count: int
    purpose: Optional[str] = None
