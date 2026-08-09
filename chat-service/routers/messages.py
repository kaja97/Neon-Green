from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import get_db
from core.response import success_response
from schemas.message import MessageCreate, MarkReadRequest
from services.message_service import MessageService
from repositories.message_repo import MessageRepository
from repositories.conversation_repo import ConversationRepository
from repositories.user_repo import ChatUserRepository
from routers.conversations import get_current_chat_user_id

router = APIRouter(tags=["Messages"])


def get_message_service() -> MessageService:
    return MessageService(
        MessageRepository(), ConversationRepository(), ChatUserRepository()
    )


@router.get("/conversations/{conversation_id}/messages", response_model=dict)
async def get_messages(
    conversation_id: str,
    before: str | None = Query(None, description="Cursor: message ID"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    msg_service: MessageService = Depends(get_message_service),
):
    """Get paginated message history for a conversation."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id")

    messages = await msg_service.get_history(
        db, conv_id=conv_uuid, user_id=chat_user_id, before_id=before, limit=limit
    )
    return success_response(messages)


@router.post("/conversations/{conversation_id}/messages", response_model=dict)
async def send_message(
    conversation_id: str,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    msg_service: MessageService = Depends(get_message_service),
):
    """Send a message via REST."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id")

    msg = await msg_service.send_message(
        db, conv_id=conv_uuid, sender_id=chat_user_id, data=data
    )
    return success_response(msg)


@router.patch("/conversations/{conversation_id}/messages/read", response_model=dict)
async def mark_messages_read(
    conversation_id: str,
    data: MarkReadRequest,
    db: AsyncSession = Depends(get_db),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    msg_service: MessageService = Depends(get_message_service),
):
    """Batch mark messages as read in a conversation."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id")

    updated_count = await msg_service.mark_read(
        db, conv_id=conv_uuid, user_id=chat_user_id, message_ids=data.message_ids
    )
    return success_response({"updated_count": updated_count})


@router.delete("/messages/{message_id}", response_model=dict)
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    msg_service: MessageService = Depends(get_message_service),
):
    """Soft-delete own message."""
    try:
        msg_uuid = uuid.UUID(message_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid message_id")

    conv_id = await msg_service.delete_message(
        db, msg_id=msg_uuid, user_id=chat_user_id
    )
    return success_response({"deleted": True, "conversation_id": str(conv_id)})
