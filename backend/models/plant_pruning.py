from sqlalchemy import String, ForeignKey, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid


class PlantPruningGuide(BaseModel):
    """Pruning reference data for a specific plant growth stage.

    Each record describes one pruning operation (type + method + timing)
    that should be performed during the linked stage.  The planner engine
    reads these to auto-generate ``FarmingActivity`` records with
    ``activity_type = "pruning"``.

    Design mirrors ``PlantFertilizerRecommendation`` — one guide per
    pruning-type per stage, linked via ``plant_stage_id``.
    """
    __tablename__ = "plant_pruning_guides"

    plant_stage_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plant_stages.id", ondelete="CASCADE")
    )

    # What kind of pruning (pinching, desuckering, topping, thinning,
    # training, formative, maintenance, rejuvenation, leaf_removal, vine_tipping)
    pruning_type: Mapped[str] = mapped_column(String(50))

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
    importance: Mapped[str] = mapped_column(String(20), default="recommended")
