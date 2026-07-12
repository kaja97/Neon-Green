from sqlalchemy import String, Boolean, ForeignKey, Numeric, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import BaseModel
import uuid

class Plant(BaseModel):
    __tablename__ = "plants"
    
    common_name: Mapped[str] = mapped_column(String(100))
    local_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    scientific_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category: Mapped[str] = mapped_column(String(100))
    sub_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    growth_duration_days: Mapped[int] = mapped_column(Integer)
    
    planting_season: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    
    optimal_temp_min: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    optimal_temp_max: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    optimal_rainfall_mm: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    optimal_ph_min: Mapped[float | None] = mapped_column(Numeric(3, 1), nullable=True)
    optimal_ph_max: Mapped[float | None] = mapped_column(Numeric(3, 1), nullable=True)
    
    expected_yield_per_acre_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    compatible_soil_types: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    companion_plants: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    incompatible_plants: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class PlantStage(BaseModel):
    __tablename__ = "plant_stages"
    
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id", ondelete="CASCADE"))
    stage_name: Mapped[str] = mapped_column(String(100))
    stage_order: Mapped[int] = mapped_column(Integer)
    start_day: Mapped[int] = mapped_column(Integer)
    end_day: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_indicators: Mapped[str | None] = mapped_column(Text, nullable=True)
    critical_actions: Mapped[str | None] = mapped_column(Text, nullable=True)
    watch_for: Mapped[str | None] = mapped_column(Text, nullable=True)

class PlantNutrientReq(BaseModel):
    __tablename__ = "plant_nutrient_requirements"
    
    plant_stage_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plant_stages.id", ondelete="CASCADE"))
    nitrogen_kg: Mapped[float] = mapped_column(Numeric(8, 2))
    phosphorus_kg: Mapped[float] = mapped_column(Numeric(8, 2))
    potassium_kg: Mapped[float] = mapped_column(Numeric(8, 2))
    calcium_kg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    magnesium_kg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)

class PlantWaterReq(BaseModel):
    __tablename__ = "plant_water_requirements"
    
    plant_stage_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plant_stages.id", ondelete="CASCADE"))
    water_mm_per_day: Mapped[float] = mapped_column(Numeric(6, 2))
    frequency_days: Mapped[int] = mapped_column(Integer)
    drought_tolerance: Mapped[str] = mapped_column(String(50))
