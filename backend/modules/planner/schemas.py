from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import date, datetime
import uuid

# Canonical activity-type enum shared between backend + frontend.
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

    # Watering resources
    required_water_liters: Optional[float] = None
    actual_water_liters: Optional[float] = None

    # Fertilizer resources
    required_fertilizer_kg: Optional[float] = None
    fertilizer_name: Optional[str] = None
    actual_fertilizer_kg: Optional[float] = None

    # Pruning details & instructions
    pruning_type: Optional[str] = None
    pruning_level: Optional[str] = None
    target_canopy_level: Optional[str] = None
    tools_needed: Optional[str] = None
    how_to_instructions: Optional[str] = None
    pre_pruning_care: Optional[str] = None
    post_pruning_care: Optional[str] = None
    waste_biomass_kg: Optional[float] = None

    # Pest Control & Spraying
    target_pest_disease: Optional[str] = None
    treatment_name: Optional[str] = None
    dosage: Optional[str] = None
    application_method: Optional[str] = None
    safety_interval_days: Optional[int] = None

    # Timeline & Notes
    day_offset: Optional[int] = None
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
    waste_biomass_kg: Optional[float] = None
    treatment_name: Optional[str] = None
    dosage: Optional[str] = None
    attachments: Optional[List[str]] = None

class SkipRequest(BaseModel):
    skipped_reason: Optional[str] = None
    reason: Optional[str] = None

    @field_validator("skipped_reason", mode="after")
    @classmethod
    def resolve_reason(cls, v: Optional[str], info) -> str:
        if v:
            return v
        values = info.data
        return values.get("reason") or ""

class ActivityCreate(BaseModel):
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
    title: Optional[str] = None
    activity_type: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None

    @field_validator("activity_type")
    @classmethod
    def _validate_activity_type(cls, v: Optional[str]) -> Optional[str]:
        return normalize_activity_type(v) if v else v
