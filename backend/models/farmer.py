from sqlalchemy import String, Boolean, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid

class FarmerLocation(BaseModel):
    __tablename__ = "farmer_locations"
    
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    district: Mapped[str] = mapped_column(String(100))
    latitude: Mapped[float] = mapped_column(Numeric(10, 8))
    longitude: Mapped[float] = mapped_column(Numeric(11, 8))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

class FarmerLandDetail(BaseModel):
    __tablename__ = "farmer_land_details"
    
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"))
    location_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_locations.id", ondelete="CASCADE"))
    total_area: Mapped[float] = mapped_column(Numeric(10, 2))
    area_unit: Mapped[str] = mapped_column(String(20), default="acres")
    soil_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    irrigation_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

class FarmerLivestock(BaseModel):
    __tablename__ = "farmer_livestock"
    
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"))
    animal_type: Mapped[str] = mapped_column(String(100))
    count: Mapped[int] = mapped_column(Numeric(10, 0))
    purpose: Mapped[str | None] = mapped_column(String(100), nullable=True)
