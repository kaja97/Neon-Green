from sqlalchemy import String, Date, ForeignKey, Numeric, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import date, datetime
from .base import BaseModel
import uuid

class WeatherCache(BaseModel):
    __tablename__ = "weather_cache"
    
    location_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_locations.id", ondelete="CASCADE"))
    forecast_date: Mapped[date] = mapped_column(Date)
    data: Mapped[dict] = mapped_column(JSONB)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

class WeatherAlert(BaseModel):
    __tablename__ = "weather_alerts"
    
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    alert_type: Mapped[str] = mapped_column(String(50)) # heavy_rain, drought, extreme_heat
    severity: Mapped[str] = mapped_column(String(20)) # low, medium, high
    message: Mapped[str] = mapped_column(Text)
    target_date: Mapped[date] = mapped_column(Date)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
