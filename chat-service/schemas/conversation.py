from pydantic import BaseModel, ConfigDict
from typing import Optional
from .user import UserResponse
from .message import MessageResponse


class ConversationResponse(BaseModel):
    id: str
    other_user: UserResponse
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class ConversationListResponse(BaseModel):
    conversations: list[ConversationResponse]
    total: int


class StartConversationRequest(BaseModel):
    target_account_id: str
