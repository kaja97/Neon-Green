from models.plant import Plant
import uuid
from sqlalchemy import String, Text, ForeignKey, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class ProductCategory(BaseModel):
    __tablename__ = "product_categories"
    
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    subcategories: Mapped[list["ProductSubCategory"]] = relationship("ProductSubCategory", back_populates="category", cascade="all, delete-orphan")


class ProductSubCategory(BaseModel):
    __tablename__ = "product_subcategories"
    
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_categories.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    category: Mapped["ProductCategory"] = relationship("ProductCategory", back_populates="subcategories")


class Product(BaseModel):
    __tablename__ = "products"
    
    seller_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_categories.id", ondelete="RESTRICT"), index=True)
    sub_category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_subcategories.id", ondelete="RESTRICT"), index=True)
    plant_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    quantity_available: Mapped[float] = mapped_column(Numeric(10, 2))
    unit: Mapped[str] = mapped_column(String(50)) # e.g. "kg", "tons", "units"
    
    price_per_unit: Mapped[float] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(10), default="LKR")
    
    condition: Mapped[str | None] = mapped_column(String(100), nullable=True) # e.g., "Fresh Harvest", "Dried", "New", "Used"
    status: Mapped[str] = mapped_column(String(50), default="available") # available, sold_out, hidden
    
    images: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    seller: Mapped["Account"] = relationship("Account", back_populates="products")
    category: Mapped["ProductCategory"] = relationship("ProductCategory")
    sub_category: Mapped["ProductSubCategory"] = relationship("ProductSubCategory")
    plant: Mapped["Plant"] = relationship("Plant")
    project: Mapped["Project"] = relationship("Project", back_populates="products")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="product", cascade="all, delete-orphan")
