from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from . import schemas, service

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/{project_id}/chat", response_model=schemas.ChatResponse)
async def chat(
    project_id: uuid.UUID,
    data: schemas.ChatRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.chat(db, project_id, current_user.id, data.message, data.conversation_id)

@router.get("/{project_id}/conversations", response_model=List[schemas.ConversationResponse])
async def list_conversations(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_conversations(db, project_id, current_user.id)

@router.get("/conversations/{conversation_id}/messages", response_model=List[schemas.MessageResponse])
async def get_messages(
    conversation_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_conversation_messages(db, conversation_id, current_user.id)

@router.get("/{project_id}/summary", response_model=schemas.SummaryResponse)
async def get_summary(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_project_summary(db, project_id, current_user.id)
