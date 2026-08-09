from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

class NotificationResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    title: str
    message: str
    type: str
    is_read: bool
    project_id: Optional[uuid.UUID] = None
    icon: Optional[str] = None
    deep_link: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationCount(BaseModel):
    unread: int
    total: int
