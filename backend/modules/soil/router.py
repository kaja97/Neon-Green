from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from . import schemas, service

router = APIRouter(prefix="/soil", tags=["soil"])

@router.post("/tests/{project_id}", response_model=schemas.SoilTestResponse)
async def create_soil_test(project_id: uuid.UUID, data: schemas.SoilTestCreate, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.submit_soil_test(db, project_id, current_user.id, data)

@router.get("/tests/{project_id}", response_model=List[schemas.SoilTestResponse])
async def get_tests(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.get_soil_tests(db, project_id, current_user.id)

@router.get("/recommendations/{project_id}", response_model=List[schemas.SoilRecommendationResponse])
async def get_recommendations(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.get_soil_recommendations(db, project_id, current_user.id)
