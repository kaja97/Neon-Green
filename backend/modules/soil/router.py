from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user, get_soil_service
from models.account import Account
from core.response import success_response
from . import schemas
from .service import SoilService

router = APIRouter(prefix="/soil", tags=["soil"])

@router.post("/tests/{project_id}", status_code=201)
async def create_soil_test(
    project_id: uuid.UUID,
    data: schemas.SoilTestCreate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    soil_service: SoilService = Depends(get_soil_service)
):
    result = await soil_service.submit_soil_test(db, project_id, current_user.id, data)
    return success_response(schemas.SoilTestDetailResponse.model_validate(result).model_dump())

@router.post("/extract-report", status_code=200)
async def extract_soil_report(
    file: UploadFile = File(...),
    current_user: Account = Depends(get_current_user),
    soil_service: SoilService = Depends(get_soil_service)
):
    """Scan file security and extract nutrient data from PDF, PNG, DOCX, XLSX using Gemini AI."""
    file_bytes = await file.read()
    filename = file.filename or "soil_report.pdf"
    content_type = file.content_type

    extracted_data = await soil_service.extract_soil_report(file_bytes, filename, content_type)
    return success_response(extracted_data)

@router.post("/upload-and-create/{project_id}", status_code=201)
async def upload_and_create_soil_test(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    soil_service: SoilService = Depends(get_soil_service)
):
    """One-click upload report file, run security scan, extract with AI, and create soil test."""
    file_bytes = await file.read()
    filename = file.filename or "soil_report.pdf"
    content_type = file.content_type

    result = await soil_service.upload_and_create_soil_test(
        db, project_id, current_user.id, file_bytes, filename, content_type
    )
    return success_response(schemas.SoilTestDetailResponse.model_validate(result).model_dump())

@router.get("/tests/{project_id}", status_code=200)
async def get_tests(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    soil_service: SoilService = Depends(get_soil_service)
):
    tests = await soil_service.get_soil_tests(db, project_id, current_user.id)
    return success_response([schemas.SoilTestDetailResponse.model_validate(t).model_dump() for t in tests])

@router.get("/recommendations/{project_id}", status_code=200)
async def get_recommendations(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    soil_service: SoilService = Depends(get_soil_service)
):
    recommendations = await soil_service.get_soil_recommendations(db, project_id, current_user.id)
    return success_response([schemas.SoilRecommendationResponse.model_validate(r).model_dump() for r in recommendations])

@router.post("/tests/{test_id}/resend-email", status_code=200)
async def resend_email(
    test_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    soil_service: SoilService = Depends(get_soil_service)
):
    result = await soil_service.resend_soil_email(db, test_id, current_user.id)
    return success_response(result)
