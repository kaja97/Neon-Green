from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class WeatherCondition(BaseModel):
    temp_celsius: float
    humidity: float
    rain_mm: float
    wind_kph: float
    description: str
    icon_code: str

class ForecastDay(BaseModel):
    forecast_date: date
    condition: WeatherCondition

class WeatherResponse(BaseModel):
    location_id: str
    current: WeatherCondition
    forecast: List[ForecastDay]

class AlertResponse(BaseModel):
    id: str
    project_id: str
    alert_type: str
    severity: str
    message: str
    target_date: date
    is_resolved: bool
