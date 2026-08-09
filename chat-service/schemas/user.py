from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, Annotated
from datetime import datetime


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

    @field_validator("id", "account_id", mode="before")
    @classmethod
    def coerce_uuid_to_str(cls, v):
        if v is not None:
            return str(v)
        return v

    @field_validator("last_seen_at", mode="before")
    @classmethod
    def coerce_datetime_to_str(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v



class UserSearchResult(BaseModel):
    users: list[UserResponse]
    total: int


class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
