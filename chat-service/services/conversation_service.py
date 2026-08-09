"""Conversation service — create, inbox, detail."""

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import uuid

from repositories.conversation_repo import ConversationRepository
from repositories.message_repo import MessageRepository
from repositories.user_repo import ChatUserRepository
from models.conversation import Conversation
from schemas.conversation import ConversationResponse
from schemas.message import MessageResponse
from schemas.user import UserResponse


class ConversationService:
    def __init__(
        self,
        conv_repo: ConversationRepository,
        msg_repo: MessageRepository,
        user_repo: ChatUserRepository,
    ):
        self.conv_repo = conv_repo
        self.msg_repo = msg_repo
        self.user_repo = user_repo

    async def get_or_create(
        self,
        db: AsyncSession,
        current_user_id: uuid.UUID,
        target_account_id: str,
        jwt_token: str,
    ) -> dict:
        """Start or get existing conversation with another user.

        Resolves target_account_id → chat_users row (auto-syncs from main
        backend if the target hasn't used chat before).
        """
        target_uuid = uuid.UUID(target_account_id)

        # Resolve target user
        target_user = await self.user_repo.get_by_account_id(db, target_uuid)
        if not target_user:
            # Auto-sync from main backend
            from services.user_service import UserService

            user_svc = UserService(self.user_repo)
            target_user = await user_svc.sync_user(db, target_account_id, jwt_token)

        if target_user.id == current_user_id:
            raise HTTPException(
                status_code=400, detail="Cannot start a conversation with yourself"
            )

        conv, created = await self.conv_repo.get_or_create(
            db, current_user_id, target_user.id
        )
        await db.commit()

        return await self._enrich_conversation(db, conv, current_user_id)

    async def list_inbox(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[dict], int]:
        """List all conversations for the user (inbox), enriched."""
        convs, total = await self.conv_repo.list_for_user(db, user_id, page, per_page)

        enriched = []
        for conv in convs:
            enriched.append(await self._enrich_conversation(db, conv, user_id))

        return enriched, total

    async def get_conversation(
        self, db: AsyncSession, conv_id: uuid.UUID, user_id: uuid.UUID
    ) -> dict:
        """Get a single conversation, validating the user is a participant."""
        conv = await self.conv_repo.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if not self.conv_repo.is_participant(conv, user_id):
            raise HTTPException(
                status_code=403,
                detail="You are not a participant of this conversation",
            )
        return await self._enrich_conversation(db, conv, user_id)

    async def _enrich_conversation(
        self, db: AsyncSession, conv: Conversation, user_id: uuid.UUID
    ) -> dict:
        """Add other_user profile, last message preview, and unread count."""
        other_id = self.conv_repo.get_other_participant(conv, user_id)
        other_user = await self.user_repo.get_by_id(db, other_id)

        # Last message
        last_msg = await self.msg_repo.get_last_message(db, conv.id)
        last_msg_resp = None
        if last_msg:
            sender = await self.user_repo.get_by_id(db, last_msg.sender_id)
            last_msg_resp = {
                "id": str(last_msg.id),
                "conversation_id": str(last_msg.conversation_id),
                "sender_id": str(last_msg.sender_id),
                "sender_name": sender.display_name if sender else "Unknown",
                "sender_avatar": sender.avatar_url if sender else None,
                "message_type": last_msg.message_type,
                "content": last_msg.content,
                "voice_url": last_msg.voice_url,
                "voice_duration": last_msg.voice_duration,
                "image_url": last_msg.image_url,
                "reply_to_id": str(last_msg.reply_to_id) if last_msg.reply_to_id else None,
                "is_read": last_msg.is_read,
                "read_at": last_msg.read_at.isoformat() if last_msg.read_at else None,
                "is_deleted": last_msg.is_deleted,
                "created_at": last_msg.created_at.isoformat() if last_msg.created_at else "",
            }

        # Unread count
        unread = await self.msg_repo.count_unread(db, conv.id, user_id)

        return {
            "id": str(conv.id),
            "other_user": {
                "id": str(other_user.id) if other_user else "",
                "account_id": str(other_user.account_id) if other_user else "",
                "display_name": other_user.display_name if other_user else "Unknown",
                "email": other_user.email if other_user else None,
                "phone": other_user.phone if other_user else None,
                "avatar_url": other_user.avatar_url if other_user else None,
                "is_online": other_user.is_online if other_user else False,
                "last_seen_at": (
                    other_user.last_seen_at.isoformat()
                    if other_user and other_user.last_seen_at
                    else None
                ),
            },
            "last_message": last_msg_resp,
            "unread_count": unread,
            "created_at": conv.created_at.isoformat() if conv.created_at else "",
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else "",
        }
