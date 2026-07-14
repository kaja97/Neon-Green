# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Query
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from core.response import success_response
from . import schemas, service

router = APIRouter(prefix="/disease", tags=["disease"])

@router.post("/issues/{project_id}", status_code=201)
async def report_issue(project_id: uuid.UUID, data: schemas.IssueCreate, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    issue = await service.report_issue(db, project_id, current_user.id, data)
    return success_response(schemas.IssueResponse.model_validate(issue).model_dump())

@router.get("/issues/{project_id}", status_code=200)
async def get_issues(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    issues = await service.get_issues(db, project_id, current_user.id)
    return success_response([schemas.IssueResponse.model_validate(i).model_dump() for i in issues])

@router.get("/search", status_code=200)
async def search_diseases(q: str = Query(...), current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    diseases = await service.search_diseases(db, q)
    return success_response([schemas.DiseaseSearchResponse.model_validate(d).model_dump() for d in diseases])

@router.post("/identify-image", status_code=200)
async def identify_image(image_url: str, current_user: Account = Depends(get_current_user)):
    """
    Placeholder for Phase 6: Computer Vision Integration.
    Will eventually take a base64 image or S3 URL and pass it to Gemini Vision.
    """
    return success_response({"message": "CV processing not yet implemented. Requires Gemini Vision integration in Phase 6.", "identified_disease": None})

@router.get("/{disease_id}/solutions", status_code=200)
async def get_solutions(disease_id: uuid.UUID, farming_method: str = Query("conventional"), current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    solutions = await service.get_disease_solutions(db, disease_id, farming_method)
    return success_response([schemas.DiseaseSolutionResponse.model_validate(s).model_dump() for s in solutions])

@router.patch("/issues/{issue_id}/resolve", status_code=200)
async def resolve_issue(issue_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    issue = await service.resolve_issue(db, issue_id, current_user.id)
    return success_response(schemas.IssueResponse.model_validate(issue).model_dump())
