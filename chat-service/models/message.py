"""Individual chat message within a conversation.

Supports three types: ``text``, ``voice``, and ``image`` (image is reserved
for future use). Voice messages store a ``voice_url`` (path to the uploaded
file) and an optional ``voice_duration`` in seconds.

``reply_to_id`` enables quoted replies (self-referencing FK, SET NULL on
parent delete so the reply survives even if the original is removed).

Soft-delete via ``is_deleted``: content + voice_url are NULLed out so the
message row remains for threading continuity but the payload is gone.
"""

from sqlalchemy import String, Boolean, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import BaseModel
import uuid


class Message(BaseModel):
    __tablename__ = "messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message_type: Mapped[str] = mapped_column(
        String(20), default="text"
    )  # text | voice | image
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    voice_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    voice_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    reply_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
