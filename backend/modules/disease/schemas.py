from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime
import uuid


# ── Issue CRUD ──

class IssueCreate(BaseModel):
    issue_type: str  # disease, pest, nutrient_deficiency, other
    title: str
    description: Optional[str] = None
    severity: str  # low, medium, high, critical
    images: Optional[List[str]] = None
    is_shared_to_community: bool = False


class IssueResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    issue_type: str
    title: str
    description: Optional[str]
    severity: str
    reported_date: date
    status: str
    resolved_date: Optional[date] = None
    images: Optional[List[str]]
    ai_diagnosis: Optional[str]
    identified_disease_id: Optional[uuid.UUID]
    identified_pest_id: Optional[uuid.UUID]
    is_shared_to_community: bool
    # enriched fields (set by service, not from_attributes)
    author_name: Optional[str] = None
    author_avatar_url: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ── Community feed ──

class CommunityFeedItem(BaseModel):
    """Slim card for the community list page."""
    id: uuid.UUID
    title: str
    issue_type: str
    severity: str
    status: str
    images: Optional[List[str]]
    author_name: Optional[str] = None
    author_avatar_url: Optional[str] = None
    plant_name: Optional[str] = None
    created_at: datetime
    comment_count: int = 0


# ── Comments ──

class CommentAuthorResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class IssueCommentResponse(BaseModel):
    id: uuid.UUID
    issue_id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    author: CommentAuthorResponse
    body: str
    images: Optional[List[str]]
    created_at: datetime
    replies: List["IssueCommentResponse"] = []

    model_config = ConfigDict(from_attributes=True)


class CommentCreate(BaseModel):
    body: str
    parent_id: Optional[uuid.UUID] = None
    images: Optional[List[str]] = None


# ── Disease search / solutions ──

class DiseaseSearchResponse(BaseModel):
    id: uuid.UUID
    plant_id: uuid.UUID
    name: str
    scientific_name: Optional[str]
    description: Optional[str]
    symptoms: List[str]
    severity: str
    image_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class DiseaseSolutionResponse(BaseModel):
    id: uuid.UUID
    farming_method: str
    solution_type: str
    treatment_name: str
    dosage: str
    instructions: str

    model_config = ConfigDict(from_attributes=True)


class DiseaseSolutionCreate(BaseModel):
    farming_method: str  # organic, conventional
    solution_type: str   # preventive, curative
    treatment_name: str
    dosage: str
    instructions: str
