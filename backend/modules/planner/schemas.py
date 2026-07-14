from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import date, datetime
import uuid

class ActivityResponse(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    activity_type: str
    title: str
    description: Optional[str] = None

    planned_date: date
    due_date: date
    status: str
    completed_at: Optional[datetime] = None

    is_ai_recommended: bool = False
    ai_reasoning: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CompleteRequest(BaseModel):
    notes: Optional[str] = None
    actual_water_liters: Optional[float] = None
    actual_fertilizer_kg: Optional[float] = None
    attachments: Optional[List[str]] = None


class SkipRequest(BaseModel):
    """Accept both 'reason' (frontend sends this) and 'skipped_reason'."""
    skipped_reason: Optional[str] = None
    reason: Optional[str] = None

    @field_validator("skipped_reason", mode="after")
    @classmethod
    def resolve_reason(cls, v: Optional[str], info) -> str:
        """Prefer skipped_reason, fall back to reason (frontend compatibility)."""
        if v:
            return v
        values = info.data
        return values.get("reason") or ""


class ActivityCreate(BaseModel):
    """Schema for farmer-created manual tasks."""
    title: str
    activity_type: str  # irrigation, fertilization, pest_control, harvesting, other
    description: Optional[str] = None
    due_date: date


class ActivityUpdate(BaseModel):
    """Schema for editing manual tasks."""
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
