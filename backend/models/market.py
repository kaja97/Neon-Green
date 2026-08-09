from sqlalchemy import String, Date, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import date
from .base import BaseModel
import uuid

class MarketPrice(BaseModel):
    __tablename__ = "market_prices"
    
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="CASCADE"))
    region: Mapped[str] = mapped_column(String(100))
    date: Mapped[date] = mapped_column(Date)
    price_per_kg: Mapped[float] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(10), default="LKR")
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)

class MarketTrend(BaseModel):
    __tablename__ = "market_trends"
    
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="CASCADE"))
    region: Mapped[str] = mapped_column(String(100))
    trend_direction: Mapped[str] = mapped_column(String(20)) # up, down, stable
    percentage_change: Mapped[float] = mapped_column(Numeric(5, 2))
    analysis: Mapped[str | None] = mapped_column(String(255), nullable=True)
