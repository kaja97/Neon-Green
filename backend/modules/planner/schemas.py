from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import date, datetime
import uuid

# Canonical activity-type enum shared between backend + frontend.
# The planner engine emits these values; the UI select uses the same set.
ACTIVITY_TYPES = [
    "irrigation",
    "fertilizer",
    "pruning",
    "pest_control",
    "disease_check",
    "harvesting",
    "weeding",
    "soil_preparation",
    "monitoring",
    "other",
]

# Map legacy planner labels to the canonical enum so already-generated
# activities (and any stragglers in the engine) render correctly in the UI.
_ACTIVITY_TYPE_ALIASES = {
    "watering": "irrigation",
    "fertilizing": "fertilizer",
    "fertilisation": "fertilizer",
    "scouting": "monitoring",
    "inspection": "monitoring",
    "pest": "pest_control",
    "disease": "disease_check",
    "prune": "pruning",
    "trimming": "pruning",
    "desuckering": "pruning",
    "topping": "pruning",
    "thinning": "pruning",
    "training": "pruning",
}


def normalize_activity_type(value: Optional[str]) -> str:
    """Normalize a raw activity type string to a canonical ACTIVITY_TYPES value.

    Unknown / unrecognized values collapse to 'other' (the free-text type),
    so we never store an unmapped string the UI can't render.
    """
    if not value:
        return "other"
    v = value.strip().lower().replace("-", "_").replace(" ", "_")
    if v in ACTIVITY_TYPES:
        return v
    if v in _ACTIVITY_TYPE_ALIASES:
        return _ACTIVITY_TYPE_ALIASES[v]
    return "other"


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

    required_fertilizer_kg: Optional[float] = None
    fertilizer_name: Optional[str] = None
    actual_fertilizer_kg: Optional[float] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("activity_type", mode="before")
    @classmethod
    def _normalize_type(cls, v):
        return normalize_activity_type(v)


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
    """Schema for farmer-created manual tasks.

    `activity_type` must be one of ACTIVITY_TYPES. `name` is an optional
    free-text label surfaced by the UI when type == 'other' (stored on title).
    """
    title: str
    activity_type: str
    name: Optional[str] = None
    description: Optional[str] = None
    due_date: date

    @field_validator("activity_type")
    @classmethod
    def _validate_activity_type(cls, v: str) -> str:
        return normalize_activity_type(v)


class ActivityUpdate(BaseModel):
    """Schema for editing manual tasks."""
    title: Optional[str] = None
    activity_type: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None

    @field_validator("activity_type")
    @classmethod
    def _validate_activity_type(cls, v: Optional[str]) -> Optional[str]:
        return normalize_activity_type(v) if v else v
