"""Local mirror of main-app users for the chat service.

We store only the fields needed for display (name, avatar) and discovery
(email, phone). The ``account_id`` links back to the ``accounts`` table in the
main AgriFarm database — but since we run in a separate DB we cannot FK to it.
Synced lazily on first JWT-authenticated contact.
"""

from sqlalchemy import String, Boolean, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import BaseModel
import uuid


class ChatUser(BaseModel):
    __tablename__ = "chat_users"

    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), unique=True, nullable=False, index=True
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    last_seen_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
