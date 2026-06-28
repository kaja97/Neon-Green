from sqlalchemy import String, Date, ForeignKey, Numeric, Text, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from datetime import date, datetime
from .base import BaseModel
import uuid

class VendorProduct(BaseModel):
    __tablename__ = "vendor_products"
    
    vendor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vendor_profiles.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String(50)) # fertilizer, seed, equipment
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(10), default="LKR")
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    images: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

class HarvestListing(BaseModel):
    __tablename__ = "harvest_listings"
    
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"))
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True) # Provenance link
    
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    total_quantity_kg: Mapped[float] = mapped_column(Numeric(10, 2))
    minimum_order_kg: Mapped[float] = mapped_column(Numeric(10, 2))
    price_per_kg: Mapped[float] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(10), default="LKR")
    
    harvest_date: Mapped[date] = mapped_column(Date)
    available_from: Mapped[date] = mapped_column(Date)
    
    status: Mapped[str] = mapped_column(String(20), default="active") # active, sold_out, expired
    images: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
