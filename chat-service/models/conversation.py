"""1-on-1 conversation between exactly two users.

The ``CHECK (participant_1 < participant_2)`` constraint combined with the
UNIQUE on the pair ensures each user-pair has at most one row, regardless of
who initiates. The service always orders the two IDs before lookup/insert.

``last_message_id`` and ``last_message_at`` are denormalized for fast inbox
sort (avoids a JOIN + window function on every inbox fetch).
"""

from sqlalchemy import ForeignKey, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import BaseModel
import uuid


class Conversation(BaseModel):
    __tablename__ = "conversations"
    __table_args__ = (
        UniqueConstraint(
            "participant_1", "participant_2", name="uq_conversation_pair"
        ),
        CheckConstraint(
            "participant_1 < participant_2", name="ck_participant_order"
        ),
    )

    participant_1: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    participant_2: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    last_message_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    last_message_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
