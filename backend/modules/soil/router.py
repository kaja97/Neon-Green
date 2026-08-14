from fastapi import APIRouter, Depends
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
