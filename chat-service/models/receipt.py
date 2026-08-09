"""Delivery and read receipts for messages.

Each receipt tracks when a message was delivered to (or read by) a specific
user. The UNIQUE constraint on (message_id, user_id) ensures at most one
receipt per user per message.
"""

from sqlalchemy import String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import func
from datetime import datetime
from .base import BaseModel
import uuid


class MessageReceipt(BaseModel):
    __tablename__ = "message_receipts"
    __table_args__ = (
        UniqueConstraint("message_id", "user_id", name="uq_receipt"),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20), default="delivered"
    )  # delivered | read
    delivered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
