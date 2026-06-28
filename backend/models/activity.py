from sqlalchemy import String, Boolean, Date, ForeignKey, Numeric, Text, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from datetime import date, datetime
from .base import BaseModel
import uuid

class ActivityPlan(BaseModel):
    __tablename__ = "activity_plans"
    
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), unique=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class FarmingActivity(BaseModel):
    __tablename__ = "farming_activities"
    
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activity_plans.id", ondelete="CASCADE"))
    activity_type: Mapped[str] = mapped_column(String(50)) # watering, fertilizing, scouting, etc.
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    planned_date: Mapped[date] = mapped_column(Date)
    due_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    is_ai_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)

class ActivityDetail(BaseModel):
    __tablename__ = "activity_details"
    
    activity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farming_activities.id", ondelete="CASCADE"), unique=True)
    # Resources needed
    required_water_liters: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    required_fertilizer_kg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    fertilizer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Execution
    actual_water_liters: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    actual_fertilizer_kg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    attachments: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
