from sqlalchemy import String, Boolean, Date, DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import date, datetime
from .base import BaseModel
import uuid

class Project(BaseModel):
    __tablename__ = "projects"
    
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id"))
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"))
    location_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_locations.id"))
    land_detail_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_land_details.id"), nullable=True)
    
    name: Mapped[str] = mapped_column(String(255))
    area: Mapped[float] = mapped_column(Numeric(10, 2))
    area_unit: Mapped[str] = mapped_column(String(20), default="acres")
    farming_method: Mapped[str] = mapped_column(String(50))
    planting_date: Mapped[date] = mapped_column(Date)
    
    status: Mapped[str] = mapped_column(String(50), default="active")
    current_stage_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("plant_stages.id"), nullable=True)
    plan_generation_status: Mapped[str] = mapped_column(String(50), default="pending")
    
    expected_harvest_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_yield_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    actual_revenue: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    actual_harvest_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    plant: Mapped["Plant"] = relationship()
    location: Mapped["FarmerLocation"] = relationship()

class ProjectService(BaseModel):
    __tablename__ = "project_services"
    __table_args__ = (
        UniqueConstraint("project_id", "service_type", name="uq_project_service"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE")
    )
    service_type: Mapped[str] = mapped_column(String(50))
    config_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    activated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
