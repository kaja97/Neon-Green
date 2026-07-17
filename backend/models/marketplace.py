import uuid
from sqlalchemy import String, Text, ForeignKey, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class Product(BaseModel):
    __tablename__ = "products"
    
    seller_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    plant_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    quantity_available: Mapped[float] = mapped_column(Numeric(10, 2))
    unit: Mapped[str] = mapped_column(String(50)) # e.g. "kg", "tons", "units"
    
    price_per_unit: Mapped[float] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(10), default="LKR")
    
    condition: Mapped[str | None] = mapped_column(String(100), nullable=True) # e.g., "Fresh Harvest", "Dried"
    status: Mapped[str] = mapped_column(String(50), default="available") # available, sold_out, hidden
    
    images: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    seller: Mapped["Account"] = relationship("Account", back_populates="products")
    plant: Mapped["Plant"] = relationship("Plant")
