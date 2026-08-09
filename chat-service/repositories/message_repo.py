"""Repository for Message CRUD, history, and read tracking."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, update
from datetime import datetime, timezone
import uuid

from models.message import Message
from models.receipt import MessageReceipt


class MessageRepository:
    """Data-access layer for the ``messages`` and ``message_receipts`` tables."""

    async def get_by_id(self, db: AsyncSession, msg_id: uuid.UUID) -> Message | None:
        result = await db.execute(select(Message).where(Message.id == msg_id))
        return result.scalars().first()

    async def create(
        self,
        db: AsyncSession,
        conversation_id: uuid.UUID,
        sender_id: uuid.UUID,
        message_type: str = "text",
        content: str | None = None,
        voice_url: str | None = None,
        voice_duration: int | None = None,
        image_url: str | None = None,
        reply_to_id: uuid.UUID | None = None,
    ) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            message_type=message_type,
            content=content,
            voice_url=voice_url,
            voice_duration=voice_duration,
            image_url=image_url,
            reply_to_id=reply_to_id,
        )
        db.add(msg)
        await db.flush()
        await db.refresh(msg)
        return msg

    async def get_history(
        self,
        db: AsyncSession,
        conversation_id: uuid.UUID,
        before_id: uuid.UUID | None = None,
        limit: int = 50,
    ) -> list[Message]:
        """Cursor-based paginated history, newest first."""
        stmt = select(Message).where(
            Message.conversation_id == conversation_id,
            Message.is_deleted.is_(False),
        )

        if before_id:
            # Get the created_at of the cursor message
            cursor_msg = await self.get_by_id(db, before_id)
            if cursor_msg:
                stmt = stmt.where(Message.created_at < cursor_msg.created_at)

        stmt = stmt.order_by(Message.created_at.desc()).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def mark_read(
        self,
        db: AsyncSession,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        message_ids: list[uuid.UUID],
    ) -> int:
        """Batch mark messages as read. Returns count updated."""
        now = datetime.now(timezone.utc)

        # Update messages table
        stmt = (
            update(Message)
            .where(
                Message.id.in_(message_ids),
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,  # Only mark others' messages
                Message.is_read.is_(False),
            )
            .values(is_read=True, read_at=now)
        )
        result = await db.execute(stmt)
        count = result.rowcount

        # Upsert receipts
        for msg_id in message_ids:
            existing = await db.execute(
                select(MessageReceipt).where(
                    MessageReceipt.message_id == msg_id,
                    MessageReceipt.user_id == user_id,
                )
            )
            receipt = existing.scalars().first()
            if receipt:
                receipt.status = "read"
                receipt.read_at = now
            else:
                receipt = MessageReceipt(
                    message_id=msg_id,
                    user_id=user_id,
                    status="read",
                    read_at=now,
                )
                db.add(receipt)

        await db.flush()
        return count

    async def soft_delete(
        self, db: AsyncSession, msg_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        """Soft-delete own message. Returns True if deleted, False if not found/not owner."""
        msg = await self.get_by_id(db, msg_id)
        if not msg or msg.sender_id != user_id:
            return False
        msg.is_deleted = True
        msg.content = None
        msg.voice_url = None
        msg.image_url = None
        await db.flush()
        return True

    async def count_unread(
        self, db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID
    ) -> int:
        """Count unread messages in a conversation (messages sent by the other user)."""
        result = await db.execute(
            select(func.count()).where(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_read.is_(False),
                Message.is_deleted.is_(False),
            )
        )
        return result.scalar() or 0

    async def get_last_message(
        self, db: AsyncSession, conversation_id: uuid.UUID
    ) -> Message | None:
        """Get the most recent message in a conversation."""
        result = await db.execute(
            select(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.is_deleted.is_(False),
            )
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        return result.scalars().first()

    async def create_delivery_receipt(
        self, db: AsyncSession, message_id: uuid.UUID, user_id: uuid.UUID
    ) -> MessageReceipt:
        """Create a delivery receipt when a message is delivered to a user."""
        receipt = MessageReceipt(
            message_id=message_id,
            user_id=user_id,
            status="delivered",
        )
        db.add(receipt)
        await db.flush()
        return receipt
