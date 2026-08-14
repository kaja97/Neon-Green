from sqlalchemy import String, Boolean, Date, ForeignKey, Numeric, Text, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
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

    activities: Mapped[list["FarmingActivity"]] = relationship("FarmingActivity", back_populates="plan", cascade="all, delete-orphan", order_by="FarmingActivity.planned_date")

class FarmingActivity(BaseModel):
    __tablename__ = "farming_activities"
    
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activity_plans.id", ondelete="CASCADE"))
    activity_type: Mapped[str] = mapped_column(String(50)) # watering, fertilizing, pruning, pest_control, scouting, harvesting
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    planned_date: Mapped[date] = mapped_column(Date)
    due_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    is_ai_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)

    plan: Mapped["ActivityPlan"] = relationship("ActivityPlan", back_populates="activities")
    detail: Mapped["ActivityDetail"] = relationship("ActivityDetail", back_populates="activity", uselist=False, cascade="all, delete-orphan", lazy="joined")

    @property
    def required_fertilizer_kg(self) -> float | None:
        return self.detail.required_fertilizer_kg if self.detail else None

    @property
    def fertilizer_name(self) -> str | None:
        return self.detail.fertilizer_name if self.detail else None

    @property
    def actual_fertilizer_kg(self) -> float | None:
        return self.detail.actual_fertilizer_kg if self.detail else None

    @property
    def pruning_type(self) -> str | None:
        return self.detail.pruning_type if self.detail else None

    @property
    def pruning_level(self) -> str | None:
        return self.detail.pruning_level if self.detail else None

    @property
    def tools_needed(self) -> str | None:
        return self.detail.tools_needed if self.detail else None

    @property
    def how_to_instructions(self) -> str | None:
        return self.detail.how_to_instructions if self.detail else None

    @property
    def notes(self) -> str | None:
        return self.detail.notes if self.detail else None

class ActivityDetail(BaseModel):
    __tablename__ = "activity_details"
    
    activity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farming_activities.id", ondelete="CASCADE"), unique=True)
    
    # ── Watering & Resources ─────────────────────────
    required_water_liters: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    actual_water_liters: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    
    # ── Fertilizer ───────────────────────────────────
    required_fertilizer_kg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    actual_fertilizer_kg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    fertilizer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Pruning & Canopy Management ──────────────────
    pruning_type: Mapped[str | None] = mapped_column(String(100), nullable=True) # pinching, topping, desuckering, thinning, canopy, sanitation
    pruning_level: Mapped[str | None] = mapped_column(String(50), nullable=True) # light, moderate, heavy, critical, formative, maintenance
    target_canopy_level: Mapped[str | None] = mapped_column(String(100), nullable=True) # top shoots, lateral branches, lower third, inner foliage
    tools_needed: Mapped[str | None] = mapped_column(Text, nullable=True) # e.g. Bypass secateurs, pruning saw, alcohol spray
    how_to_instructions: Mapped[str | None] = mapped_column(Text, nullable=True) # Comprehensive step-by-step paragraph
    pre_pruning_care: Mapped[str | None] = mapped_column(Text, nullable=True)
    post_pruning_care: Mapped[str | None] = mapped_column(Text, nullable=True)
    waste_biomass_kg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)

    # ── Pest Control & Plant Health ──────────────────
    target_pest_disease: Mapped[str | None] = mapped_column(String(200), nullable=True)
    treatment_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dosage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    application_method: Mapped[str | None] = mapped_column(String(100), nullable=True) # foliar spray, soil drench, pheromone trap
    safety_interval_days: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # ── Timeline & Logs ──────────────────────────────
    day_offset: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    attachments: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    activity: Mapped[FarmingActivity] = relationship("FarmingActivity", back_populates="detail")
