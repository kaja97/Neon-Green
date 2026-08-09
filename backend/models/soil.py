from sqlalchemy import String, Date, ForeignKey, Numeric, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import date, datetime
from .base import BaseModel
import uuid

class SoilTest(BaseModel):
    __tablename__ = "soil_tests"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    test_date: Mapped[date] = mapped_column(Date)
    tested_by: Mapped[str | None] = mapped_column(String(100), nullable=True) # lab name or "self"
    status: Mapped[str] = mapped_column(String(50), default="completed") # pending, completed
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

class SoilNutrientResult(BaseModel):
    __tablename__ = "soil_nutrient_results"

    soil_test_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("soil_tests.id", ondelete="CASCADE"), unique=True)

    # Physical & Chemical Properties
    ph_level: Mapped[float] = mapped_column(Numeric(3, 1))  # Range 1-14, required
    electrical_conductivity_ec: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)  # ds/m
    organic_carbon_oc: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)  # %
    cation_exchange_capacity_cec: Mapped[float | None] = mapped_column(Numeric(5, 1), nullable=True)  # meq/100g

    # Primary Macronutrients (ppm or kg/ha)
    nitrogen_n: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)  # ppm
    phosphorus_p: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)  # ppm
    potassium_k: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)  # ppm

    # Secondary Macronutrients (ppm)
    calcium_ca: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)  # ppm
    magnesium_mg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)  # ppm
    sulfur_s: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)  # ppm

    # Micronutrients / Trace Elements (ppm)
    zinc_zn: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)  # ppm
    boron_b: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)  # ppm
    iron_fe: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)  # ppm
    manganese_mn: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)  # ppm
    copper_cu: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)  # ppm

class SoilRecommendation(BaseModel):
    __tablename__ = "soil_recommendations"

    soil_test_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("soil_tests.id", ondelete="CASCADE"))
    recommendation_type: Mapped[str] = mapped_column(String(50)) # fertilizer, amendment, practice
    description: Mapped[str] = mapped_column(Text)
    is_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    applied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
