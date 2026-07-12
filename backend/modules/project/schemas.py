from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import date
from core.enums import ProjectStatus, FarmingMethod, ServiceType
import uuid

# --- Master Data Schemas ---
class PlantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    common_name: str
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: str
    growth_duration_days: int
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    expected_yield_per_acre_kg: Optional[float] = None
    description: Optional[str] = None

class PlantStageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_id: uuid.UUID
    stage_name: str
    stage_order: int
    start_day: int
    end_day: int

class FarmingMethodResponse(BaseModel):
    id: str
    name: str
    description: str

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    plant_id: uuid.UUID
    location_id: uuid.UUID
    land_detail_id: Optional[uuid.UUID] = None
    area: float = Field(..., gt=0)
    area_unit: str = Field(default="acres", max_length=20)
    farming_method: FarmingMethod
    planting_date: date

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    farmer_id: uuid.UUID
    plant_id: uuid.UUID
    location_id: uuid.UUID
    land_detail_id: Optional[uuid.UUID] = None
    name: str
    area: float
    area_unit: str
    farming_method: str
    planting_date: date
    status: str
    current_stage_id: Optional[uuid.UUID] = None
    plan_generation_status: str
    expected_harvest_date: Optional[date] = None
    actual_harvest_date: Optional[date] = None

class ProjectStatusUpdate(BaseModel):
    """Status change with state machine enforcement."""
    status: ProjectStatus
    harvest_date: Optional[date] = None  # Required when status = harvested

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    area: Optional[float] = Field(None, gt=0)
    area_unit: Optional[str] = Field(None, max_length=20)
    farming_method: Optional[FarmingMethod] = None

# --- Project Service Schema ---
class ProjectServiceToggle(BaseModel):
    """Enable/disable a service for a project."""
    service_type: ServiceType
    is_enabled: bool = True

class ProjectServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    service_type: str
    is_enabled: bool

# --- Dashboard Schemas ---
class StageProgress(BaseModel):
    stage: PlantStageResponse
    progress_percentage: int
    is_current: bool
    is_completed: bool

class FarmingCircleResponse(BaseModel):
    stages: List[StageProgress]
    current_day: int
    total_days: int

class DashboardResponse(BaseModel):
    project: ProjectResponse
    current_stage: Optional[PlantStageResponse] = None
    farming_circle: FarmingCircleResponse
    # Following fields are placeholders for when other modules are integrated
    todays_activities: List[Dict[str, Any]] = []
    upcoming_activities: List[Dict[str, Any]] = []
    weather: Optional[Dict[str, Any]] = None
    weather_alerts: List[Dict[str, Any]] = []
    soil_status: Optional[Dict[str, Any]] = None
    active_issues: List[Dict[str, Any]] = []
    market_price: Optional[Dict[str, Any]] = None
    notifications: List[Dict[str, Any]] = []
    ai_summary: Optional[Dict[str, Any]] = None
