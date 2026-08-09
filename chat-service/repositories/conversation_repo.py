"""Repository for Conversation CRUD and inbox queries."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_
import uuid

from models.conversation import Conversation
from models.message import Message
from models.user import ChatUser


class ConversationRepository:
    """Data-access layer for the ``conversations`` table."""

    async def get_by_id(
        self, db: AsyncSession, conv_id: uuid.UUID
    ) -> Conversation | None:
        result = await db.execute(
            select(Conversation).where(Conversation.id == conv_id)
        )
        return result.scalars().first()

    async def get_by_participants(
        self, db: AsyncSession, user_id_1: uuid.UUID, user_id_2: uuid.UUID
    ) -> Conversation | None:
        """Find existing conversation between two users.

        Always orders IDs to match the CHECK constraint.
        """
        p1, p2 = sorted([user_id_1, user_id_2])
        result = await db.execute(
            select(Conversation).where(
                Conversation.participant_1 == p1,
                Conversation.participant_2 == p2,
            )
        )
        return result.scalars().first()

    async def create(
        self, db: AsyncSession, user_id_1: uuid.UUID, user_id_2: uuid.UUID
    ) -> Conversation:
        """Create a new conversation. Orders participant IDs automatically."""
        p1, p2 = sorted([user_id_1, user_id_2])
        conv = Conversation(participant_1=p1, participant_2=p2)
        db.add(conv)
        await db.flush()
        return conv

    async def get_or_create(
        self, db: AsyncSession, user_id_1: uuid.UUID, user_id_2: uuid.UUID
    ) -> tuple[Conversation, bool]:
        """Idempotent: return existing or create new. Returns (conv, created)."""
        existing = await self.get_by_participants(db, user_id_1, user_id_2)
        if existing:
            return existing, False
        conv = await self.create(db, user_id_1, user_id_2)
        return conv, True

    async def list_for_user(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[Conversation], int]:
        """Inbox: all conversations involving this user, sorted by last_message_at DESC."""
        condition = or_(
            Conversation.participant_1 == user_id,
            Conversation.participant_2 == user_id,
        )

        # Count
        count_stmt = select(func.count()).select_from(
            select(Conversation).where(condition).subquery()
        )
        total = (await db.execute(count_stmt)).scalar() or 0

        # Page
        offset = (page - 1) * per_page
        stmt = (
            select(Conversation)
            .where(condition)
            .order_by(Conversation.last_message_at.desc().nullslast())
            .limit(per_page)
            .offset(offset)
        )
        result = await db.execute(stmt)
        convs = list(result.scalars().all())

        return convs, total

    async def update_last_message(
        self,
        db: AsyncSession,
        conv_id: uuid.UUID,
        message_id: uuid.UUID,
        message_at,
    ) -> None:
        """Denormalize the last message info for fast inbox sort."""
        conv = await self.get_by_id(db, conv_id)
        if conv:
            conv.last_message_id = message_id
            conv.last_message_at = message_at
            await db.flush()

    def is_participant(self, conv: Conversation, user_id: uuid.UUID) -> bool:
        """Check if a user is part of a conversation."""
        return conv.participant_1 == user_id or conv.participant_2 == user_id

    def get_other_participant(
        self, conv: Conversation, user_id: uuid.UUID
    ) -> uuid.UUID:
        """Return the other participant's chat_user.id."""
        if conv.participant_1 == user_id:
            return conv.participant_2
        return conv.participant_1
