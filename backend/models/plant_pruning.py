from sqlalchemy import String, ForeignKey, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid

class PlantPruningGuide(BaseModel):
    """Pruning reference data for a specific plant growth stage.

    Describes specific pruning operations (type, method, timing, care, tools)
    to perform on a crop during a growth stage.
    """
    __tablename__ = "plant_pruning_guides"

    plant_stage_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plant_stages.id", ondelete="CASCADE")
    )

    # Pruning Type: pinching, desuckering, topping, thinning, training, formative, maintenance, leaf_removal, sanitization
    pruning_type: Mapped[str] = mapped_column(String(100))

    # Step-by-step description of how to perform this pruning
    pruning_method: Mapped[str] = mapped_column(Text)

    # When to start within the stage (offset from stage start_day)
    trigger_day: Mapped[int] = mapped_column(Integer, default=0)

    # Repeat every N days (0 = one-time only)
    frequency_days: Mapped[int] = mapped_column(Integer, default=0)

    # Pre-pruning preparation (sterilize tools, check weather, etc.)
    pre_pruning: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Post-pruning care (apply fungicide, monitor for disease, etc.)
    post_pruning: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Tools needed for this pruning operation
    tools_needed: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Seasonal / weather considerations
    season_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Importance level: critical, recommended, optional
    importance: Mapped[str] = mapped_column(String(50), default="recommended")

    stage: Mapped["PlantStage"] = relationship("PlantStage", back_populates="pruning_guides")
