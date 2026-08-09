from sqlalchemy import String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import BaseModel
import uuid

class Notification(BaseModel):
    __tablename__ = "notifications"
    
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"))
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    
    type: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    deep_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    target_block: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_pushed: Mapped[bool] = mapped_column(Boolean, default=False)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
