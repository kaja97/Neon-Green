# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Query
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from . import schemas, service

router = APIRouter(prefix="/disease", tags=["disease"])

@router.post("/issues/{project_id}", response_model=schemas.IssueResponse)
async def report_issue(project_id: uuid.UUID, data: schemas.IssueCreate, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.report_issue(db, project_id, current_user.id, data)

@router.get("/issues/{project_id}", response_model=List[schemas.IssueResponse])
async def get_issues(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.get_issues(db, project_id, current_user.id)

@router.get("/search", response_model=List[schemas.DiseaseSearchResponse])
async def search_diseases(q: str = Query(...), current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.search_diseases(db, q)

@router.post("/identify-image")
async def identify_image(image_url: str, current_user: Account = Depends(get_current_user)):
    """
    Placeholder for Phase 6: Computer Vision Integration.
    Will eventually take a base64 image or S3 URL and pass it to Gemini Vision.
    """
    return {"message": "CV processing not yet implemented. Requires Gemini Vision integration in Phase 6.", "identified_disease": None}

@router.get("/{disease_id}/solutions", response_model=List[schemas.DiseaseSolutionResponse])
async def get_solutions(disease_id: uuid.UUID, farming_method: str = Query("conventional"), current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.get_disease_solutions(db, disease_id, farming_method)

@router.patch("/issues/{issue_id}/resolve", response_model=schemas.IssueResponse)
async def resolve_issue(issue_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.resolve_issue(db, issue_id, current_user.id)
