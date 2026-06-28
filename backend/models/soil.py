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
    ph_level: Mapped[float] = mapped_column(Numeric(3, 1))
    nitrogen_level: Mapped[str] = mapped_column(String(20)) # Low, Medium, High
    phosphorus_level: Mapped[str] = mapped_column(String(20))
    potassium_level: Mapped[str] = mapped_column(String(20))
    organic_matter_perc: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    moisture_level: Mapped[str | None] = mapped_column(String(20), nullable=True)

class SoilRecommendation(BaseModel):
    __tablename__ = "soil_recommendations"
    
    soil_test_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("soil_tests.id", ondelete="CASCADE"))
    recommendation_type: Mapped[str] = mapped_column(String(50)) # fertilizer, amendment, practice
    description: Mapped[str] = mapped_column(Text)
    is_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    applied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
