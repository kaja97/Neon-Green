"""Message service — send, history, mark read, delete."""

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import uuid

from repositories.message_repo import MessageRepository
from repositories.conversation_repo import ConversationRepository
from repositories.user_repo import ChatUserRepository
from schemas.message import MessageCreate


class MessageService:
    def __init__(
        self,
        msg_repo: MessageRepository,
        conv_repo: ConversationRepository,
        user_repo: ChatUserRepository,
    ):
        self.msg_repo = msg_repo
        self.conv_repo = conv_repo
        self.user_repo = user_repo

    async def send_message(
        self,
        db: AsyncSession,
        conv_id: uuid.UUID,
        sender_id: uuid.UUID,
        data: MessageCreate,
    ) -> dict:
        """Send a message in a conversation.

        1. Validate sender is a participant
        2. Create Message row
        3. Update conversation's last_message denormalization
        4. Return enriched MessageResponse dict
        """
        conv = await self.conv_repo.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if not self.conv_repo.is_participant(conv, sender_id):
            raise HTTPException(
                status_code=403, detail="Not a participant of this conversation"
            )

        # Validate content
        if data.message_type == "text" and not data.content:
            raise HTTPException(
                status_code=400, detail="Text messages must have content"
            )
        if data.message_type == "voice" and not data.voice_url:
            raise HTTPException(
                status_code=400, detail="Voice messages must have a voice_url"
            )

        reply_to_uuid = uuid.UUID(data.reply_to_id) if data.reply_to_id else None

        msg = await self.msg_repo.create(
            db,
            conversation_id=conv_id,
            sender_id=sender_id,
            message_type=data.message_type,
            content=data.content,
            voice_url=data.voice_url,
            voice_duration=data.voice_duration,
            image_url=data.image_url,
            reply_to_id=reply_to_uuid,
        )

        # Update conversation's last message
        await self.conv_repo.update_last_message(
            db, conv_id, msg.id, msg.created_at
        )
        await db.commit()

        return await self._enrich_message(db, msg)

    async def get_history(
        self,
        db: AsyncSession,
        conv_id: uuid.UUID,
        user_id: uuid.UUID,
        before_id: str | None = None,
        limit: int = 50,
    ) -> list[dict]:
        """Cursor-based message history for a conversation."""
        conv = await self.conv_repo.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if not self.conv_repo.is_participant(conv, user_id):
            raise HTTPException(
                status_code=403, detail="Not a participant of this conversation"
            )

        before_uuid = uuid.UUID(before_id) if before_id else None
        messages = await self.msg_repo.get_history(db, conv_id, before_uuid, limit)

        enriched = []
        for msg in messages:
            enriched.append(await self._enrich_message(db, msg))
        return enriched

    async def mark_read(
        self,
        db: AsyncSession,
        conv_id: uuid.UUID,
        user_id: uuid.UUID,
        message_ids: list[str],
    ) -> int:
        """Batch mark messages as read."""
        conv = await self.conv_repo.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if not self.conv_repo.is_participant(conv, user_id):
            raise HTTPException(
                status_code=403, detail="Not a participant of this conversation"
            )

        msg_uuids = [uuid.UUID(mid) for mid in message_ids]
        count = await self.msg_repo.mark_read(db, conv_id, user_id, msg_uuids)
        await db.commit()
        return count

    async def delete_message(
        self,
        db: AsyncSession,
        msg_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> uuid.UUID:
        """Soft-delete own message. Returns conversation_id for WS broadcast."""
        msg = await self.msg_repo.get_by_id(db, msg_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if msg.sender_id != user_id:
            raise HTTPException(
                status_code=403, detail="Can only delete your own messages"
            )

        success = await self.msg_repo.soft_delete(db, msg_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Message not found")

        await db.commit()
        return msg.conversation_id

    async def _enrich_message(self, db: AsyncSession, msg) -> dict:
        """Build a full MessageResponse dict with sender info and reply preview."""
        sender = await self.user_repo.get_by_id(db, msg.sender_id)

        reply_preview = None
        if msg.reply_to_id:
            replied_msg = await self.msg_repo.get_by_id(db, msg.reply_to_id)
            if replied_msg and replied_msg.content:
                reply_preview = replied_msg.content[:100]
            elif replied_msg and replied_msg.message_type == "voice":
                reply_preview = "🎤 Voice message"

        return {
            "id": str(msg.id),
            "conversation_id": str(msg.conversation_id),
            "sender_id": str(msg.sender_id),
            "sender_name": sender.display_name if sender else "Unknown",
            "sender_avatar": sender.avatar_url if sender else None,
            "message_type": msg.message_type,
            "content": msg.content if not msg.is_deleted else None,
            "voice_url": msg.voice_url if not msg.is_deleted else None,
            "voice_duration": msg.voice_duration,
            "image_url": msg.image_url if not msg.is_deleted else None,
            "reply_to_id": str(msg.reply_to_id) if msg.reply_to_id else None,
            "reply_preview": reply_preview,
            "is_read": msg.is_read,
            "read_at": msg.read_at.isoformat() if msg.read_at else None,
            "is_deleted": msg.is_deleted,
            "created_at": msg.created_at.isoformat() if msg.created_at else "",
        }
