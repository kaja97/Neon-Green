from sqlalchemy import String, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid

class PlantFertilizerRecommendation(BaseModel):
    __tablename__ = "plant_fertilizer_recommendations"

    plant_stage_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plant_stages.id", ondelete="CASCADE")
    )
    farming_method: Mapped[str] = mapped_column(String(50))
    fertilizer_name: Mapped[str] = mapped_column(String(255))
    application_rate_per_acre_kg: Mapped[float] = mapped_column(Numeric(8, 2))
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)

    stage: Mapped["PlantStage"] = relationship("PlantStage", back_populates="fertilizer_recommendations")
