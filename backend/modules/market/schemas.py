from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date as date_type
import uuid

class PriceResponse(BaseModel):
    id: uuid.UUID
    plant_id: uuid.UUID
    region: str
    price_per_kg: float
    currency: str
    source: Optional[str] = None
    date: date_type

    model_config = ConfigDict(from_attributes=True)

class TrendResponse(BaseModel):
    plant_id: uuid.UUID
    plant_name: str
    region: str
    current_price: float
    price_30d_ago: float
    change_percentage: float
    direction: str  # "up", "down", "stable"
    min_price_30d: float
    max_price_30d: float
    avg_price_30d: float

class RevenueEstimate(BaseModel):
    project_id: uuid.UUID
    crop_name: str
    area: float
    area_unit: str
    expected_yield_kg: float
    current_price_per_kg: float
    estimated_revenue: float
    currency: str
    region: str
