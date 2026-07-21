from pydantic import BaseModel, ConfigDict
from typing import Optional


class MessageCreate(BaseModel):
    content: Optional[str] = None
    message_type: str = "text"  # text | voice | image
    voice_url: Optional[str] = None
    voice_duration: Optional[int] = None
    image_url: Optional[str] = None
    reply_to_id: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_avatar: Optional[str] = None
    message_type: str
    content: Optional[str] = None
    voice_url: Optional[str] = None
    voice_duration: Optional[int] = None
    image_url: Optional[str] = None
    reply_to_id: Optional[str] = None
    reply_preview: Optional[str] = None  # first 100 chars of replied message
    is_read: bool = False
    read_at: Optional[str] = None
    is_deleted: bool = False
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class MessageHistoryParams(BaseModel):
    before: Optional[str] = None  # cursor: message ID to paginate before
    limit: int = 50


class MarkReadRequest(BaseModel):
    message_ids: list[str]
