from sqlalchemy import String, Boolean, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid


class ProductCatalog(BaseModel):
    """Master catalog of soil/fertilizer products (organic + inorganic).

    Decoupled from specific plant stages so products can be matched
    dynamically against stage-aware nutrient deficits by the agronomy engine.
    """
    __tablename__ = "product_catalog"

    name: Mapped[str] = mapped_column(String(255))  # e.g. "Urea (46% N)", "Compost", "Bone Meal"
    product_type: Mapped[str] = mapped_column(String(50))  # fertilizer, amendment, organic, pesticide
    farming_method: Mapped[str] = mapped_column(String(50), default="both")  # organic, inorganic, both
    primary_nutrient: Mapped[str | None] = mapped_column(String(20), nullable=True)  # N, P, K, Ca, Mg, S, Zn, B, Fe, Mn, Cu
    npk_ratio: Mapped[str | None] = mapped_column(String(20), nullable=True)  # e.g. "46-0-0"
    application_rate_per_acre_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)  # reference default
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ProductNutrientContent(BaseModel):
    """Per-nutrient composition of a ProductCatalog entry.

    ``nutrient_code`` matches the attribute keys used in ``models/soil.py``
    (SoilNutrientResult) and in ``soil/calculator.py`` OPTIMAL_RANGES, so the
    agronomy engine can join soil deficits directly to product contents.
    """
    __tablename__ = "product_nutrient_content"

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_catalog.id", ondelete="CASCADE"))
    nutrient_code: Mapped[str] = mapped_column(String(30))  # nitrogen_n, phosphorus_p, potassium_k, calcium_ca, ...
    nutrient_name: Mapped[str] = mapped_column(String(50))  # Nitrogen, Phosphorus, Potassium, ...
    content_percentage: Mapped[float] = mapped_column(Numeric(6, 2))  # % of nutrient in the product (0-100)
    availability: Mapped[str] = mapped_column(String(20), default="medium")  # fast, medium, slow
