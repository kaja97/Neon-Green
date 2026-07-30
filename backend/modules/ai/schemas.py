from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[uuid.UUID] = None

class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    user_message: str
    ai_response: str
    intent: str
    tokens_used: Optional[int] = None

class ConversationResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    session_title: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    tokens_used: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SummaryResponse(BaseModel):
    project_id: uuid.UUID
    summary: dict
    last_updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
