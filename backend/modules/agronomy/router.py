"""Agronomy router — exposes the agronomy reasoning as REST endpoints.

All endpoints are read-only GETs. They power:
  • the project page (nutrient-needs, context)
  • the fertilizer page (products)
  • admin / debug (products catalog)

Authentication is the same farmer-scoped pattern used by every other module.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import get_db
from dependencies import get_current_user, get_agronomy_service
from models.account import Account
from core.response import success_response
from . import schemas
from .service import AgronomyService

router = APIRouter(prefix="/agronomy", tags=["agronomy"])


@router.get("/{project_id}/nutrient-needs")
async def get_nutrient_needs(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    service: AgronomyService = Depends(get_agronomy_service),
):
    """Stage-aware nutrient needs for the project (Method A)."""
    payload = await service.calculate_nutrient_needs(db, project_id, current_user.id)
    return success_response(payload)


@router.get("/{project_id}/products")
async def get_products(
    project_id: uuid.UUID,
    stage: str = Query("current", pattern="^(current|overall)$"),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    service: AgronomyService = Depends(get_agronomy_service),
):
    """Recommended products to address current deficits (Method A)."""
    payload = await service.recommend_products(db, project_id, current_user.id, stage=stage)
    return success_response(payload)


@router.get("/{project_id}/context")
async def get_context(
    project_id: uuid.UUID,
    mode: str = Query("full", pattern="^(full|compact|rag)$"),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    service: AgronomyService = Depends(get_agronomy_service),
):
    """Full structured project context (Method B — preview / debug).

    The ai module consumes the same payload internally via the service.
    """
    payload = await service.build_context(db, project_id, current_user.id, mode=mode)
    return success_response(payload)


@router.get("/products")
async def list_products(
    primary_nutrient: str | None = Query(None),
    farming_method: str | None = Query(None),
    product_type: str | None = Query(None),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    service: AgronomyService = Depends(get_agronomy_service),
):
    """Browse the product catalog (admin / listing support)."""
    products = await service.get_product_catalog(
        db,
        primary_nutrient=primary_nutrient,
        farming_method=farming_method,
        product_type=product_type,
    )
    return success_response(
        [schemas.ProductCatalogResponse.model_validate(p).model_dump() for p in products]
    )
