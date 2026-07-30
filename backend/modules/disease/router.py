from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from database import get_db
from dependencies import get_current_user, get_disease_service
from models.account import Account
from core.response import success_response
from . import schemas
from .service import DiseaseService

router = APIRouter(prefix="/disease", tags=["disease"])

# ── Issue CRUD (owner-scoped) ──

@router.post("/issues/{project_id}", status_code=201)
async def report_issue(
    project_id: uuid.UUID,
    data: schemas.IssueCreate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    issue = await disease_service.report_issue(db, project_id, current_user.id, data)
    return success_response(schemas.IssueResponse.model_validate(issue).model_dump())


@router.get("/issues/{project_id}", status_code=200)
async def get_issues(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    issues = await disease_service.get_issues(db, project_id, current_user.id)
    return success_response([schemas.IssueResponse.model_validate(i).model_dump() for i in issues])


@router.patch("/issues/{issue_id}/resolve", status_code=200)
async def resolve_issue(
    issue_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    issue = await disease_service.resolve_issue(db, issue_id, current_user.id)
    return success_response(schemas.IssueResponse.model_validate(issue).model_dump())


# ── Disease search / solutions ──

@router.get("/search", status_code=200)
async def search_diseases(
    q: str = Query(...),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    diseases = await disease_service.search_diseases(db, q)
    return success_response([schemas.DiseaseSearchResponse.model_validate(d).model_dump() for d in diseases])


@router.post("/identify-image", status_code=200)
async def identify_image(
    image_url: str,
    current_user: Account = Depends(get_current_user),
):
    """
    Placeholder for Phase 6: Computer Vision Integration.
    Will eventually take a base64 image or S3 URL and pass it to Gemini Vision.
    """
    return success_response({"message": "CV processing not yet implemented. Requires Gemini Vision integration in Phase 6.", "identified_disease": None})


@router.get("/{disease_id}/solutions", status_code=200)
async def get_solutions(
    disease_id: uuid.UUID,
    farming_method: str = Query("conventional"),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    solutions = await disease_service.get_disease_solutions(db, disease_id, farming_method)
    return success_response([schemas.DiseaseSolutionResponse.model_validate(s).model_dump() for s in solutions])


# ── Community feed (any authenticated farmer) ──

@router.get("/community", status_code=200)
async def list_community_issues(
    issue_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    items = await disease_service.list_community_issues(
        db, issue_type=issue_type, page=page, per_page=per_page,
    )
    return success_response([i.model_dump() for i in items])


@router.get("/community/{issue_id}", status_code=200)
async def get_community_issue(
    issue_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    data = await disease_service.get_community_issue(db, issue_id)
    return success_response(data)


@router.get("/community/{issue_id}/comments", status_code=200)
async def list_comments(
    issue_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    tree = await disease_service.list_comments(db, issue_id)
    return success_response(tree)


@router.post("/community/{issue_id}/comments", status_code=201)
async def create_comment(
    issue_id: uuid.UUID,
    data: schemas.CommentCreate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    disease_service: DiseaseService = Depends(get_disease_service),
):
    comment = await disease_service.create_comment(db, issue_id, current_user.id, data)
    return success_response(comment)
