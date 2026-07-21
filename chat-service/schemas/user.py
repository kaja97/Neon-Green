from pydantic import BaseModel, ConfigDict
from typing import Optional


class UserResponse(BaseModel):
    id: str
    account_id: str
    display_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_online: bool = False
    last_seen_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserSearchResult(BaseModel):
    users: list[UserResponse]
    total: int


class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
