from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time
import uuid

class ActivityResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    stage_id: Optional[uuid.UUID] = None
    activity_type: str
    title: str
    description: Optional[str] = None
    scheduled_date: date
    scheduled_time: Optional[time] = None
    priority: int
    status: str
    completed_date: Optional[date] = None
    skipped_reason: Optional[str] = None
    notes: Optional[str] = None

class CompleteRequest(BaseModel):
    notes: Optional[str] = None

class SkipRequest(BaseModel):
    skipped_reason: str
