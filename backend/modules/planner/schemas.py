from pydantic import BaseModel, ConfigDict
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
    skipped_reason: str
