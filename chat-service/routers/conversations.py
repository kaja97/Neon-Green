from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import get_db
from core.security import get_current_user_id
from core.response import success_response
from schemas.conversation import StartConversationRequest
from services.conversation_service import ConversationService
from repositories.conversation_repo import ConversationRepository
from repositories.message_repo import MessageRepository
from repositories.user_repo import ChatUserRepository

router = APIRouter(prefix="/conversations", tags=["Conversations"])


def get_conversation_service() -> ConversationService:
    return ConversationService(
        ConversationRepository(), MessageRepository(), ChatUserRepository()
    )


async def get_current_chat_user_id(
    db: AsyncSession = Depends(get_db),
    account_id: str = Depends(get_current_user_id),
) -> uuid.UUID:
    """Helper to resolve main app account_id to chat_users.id"""
    user_repo = ChatUserRepository()
    user = await user_repo.get_by_account_id(db, uuid.UUID(account_id))
    if not user:
        raise HTTPException(status_code=401, detail="Chat profile not synced. Call /users/me first.")
    return user.id


@router.get("", response_model=dict)
async def list_conversations(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Inbox: list all conversations for the current user."""
    convs, total = await conv_service.list_inbox(
        db, user_id=chat_user_id, page=page, per_page=per_page
    )
    return success_response({"conversations": convs, "total": total})


@router.post("", response_model=dict)
async def start_conversation(
    data: StartConversationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Start or get an existing 1-on-1 conversation."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth header")
    token = auth_header.split(" ")[1]

    conv = await conv_service.get_or_create(
        db, 
        current_user_id=chat_user_id, 
        target_account_id=data.target_account_id, 
        jwt_token=token
    )
    return success_response(conv)


@router.get("/{conversation_id}", response_model=dict)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Get single conversation detail."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id")

    conv = await conv_service.get_conversation(db, conv_uuid, chat_user_id)
    return success_response(conv)
