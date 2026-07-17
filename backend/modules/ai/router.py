from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user, get_ai_service
from models.account import Account
from core.response import success_response
from . import schemas
from .service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/{project_id}/chat", status_code=200)
async def chat(
    project_id: uuid.UUID,
    data: schemas.ChatRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service)
):
    result = await ai_service.chat(db, project_id, current_user.id, data.message, data.conversation_id)
    return success_response(schemas.ChatResponse.model_validate(result).model_dump())

@router.get("/{project_id}/conversations", status_code=200)
async def list_conversations(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service)
):
    conversations = await ai_service.get_conversations(db, project_id, current_user.id)
    return success_response([schemas.ConversationResponse.model_validate(c).model_dump() for c in conversations])

@router.get("/conversations/{conversation_id}/messages", status_code=200)
async def get_messages(
    conversation_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service)
):
    messages = await ai_service.get_conversation_messages(db, conversation_id, current_user.id)
    return success_response([schemas.MessageResponse.model_validate(m).model_dump() for m in messages])

@router.get("/{project_id}/summary", status_code=200)
async def get_summary(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service)
):
    data = await ai_service.get_project_summary(db, project_id, current_user.id)
    return success_response(schemas.SummaryResponse.model_validate(data).model_dump())
