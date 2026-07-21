from sqlalchemy import String, Date, ForeignKey, Numeric, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from datetime import date, datetime
from .base import BaseModel
import uuid

class ProjectIssue(BaseModel):
    __tablename__ = "project_issues"
    
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    issue_type: Mapped[str] = mapped_column(String(50)) # disease, pest, nutrient_deficiency, other
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(20)) # low, medium, high, critical
    
    reported_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="open") # open, in_progress, resolved
    resolved_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # When True this issue is visible in the community feed and any authenticated
    # farmer can read it and comment. Default False keeps existing issues private.
    is_shared_to_community: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    # Optional links to master data if identified
    identified_disease_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("plant_diseases.id"), nullable=True)
    identified_pest_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("plant_pests.id"), nullable=True)
    
    images: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    ai_diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
