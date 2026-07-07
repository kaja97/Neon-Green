from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import date
import uuid

# --- Master Data Schemas ---
class PlantResponse(BaseModel):
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
    name: str
    plant_id: uuid.UUID
    location_id: uuid.UUID
    land_detail_id: Optional[uuid.UUID] = None
    area: float
    area_unit: str = "acres"
    farming_method: str
    planting_date: date

class ProjectResponse(BaseModel):
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

class ProjectStatusUpdate(BaseModel):
    status: str

class ProjectServiceResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    service_type: str
    is_active: bool
    config_json: Optional[dict] = None

    class Config:
        from_attributes = True

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
    enabled_services: List[str] = []
    todays_activities: List[Dict[str, Any]] = []
    upcoming_activities: List[Dict[str, Any]] = []
    weather: Optional[Dict[str, Any]] = None
    weather_alerts: List[Dict[str, Any]] = []
    soil_status: Optional[Dict[str, Any]] = None
    active_issues: List[Dict[str, Any]] = []
    market_price: Optional[Dict[str, Any]] = None
    notifications: List[Dict[str, Any]] = []
