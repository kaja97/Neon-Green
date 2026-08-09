"""AgronomyService — orchestrates the agronomy module.

Thin orchestration layer over the pure-function engine/matcher/builder.
Public methods are the API surface used by the router AND by other modules
(notably the ai/ module, which calls build_context for its Gemini payload).
"""
from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from core.base_service import BaseService
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from models.account import FarmerProfile
from models.project import Project

from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from modules.agronomy.repository import (
    ProductCatalogRepository,
    ProductNutrientContentRepository,
)
from modules.agronomy.nutrient_engine import calculate_stage_needs, needs_to_dict
from modules.agronomy.product_matcher import recommend_products
from modules.agronomy.context_builder import build_project_context

logger = logging.getLogger(__name__)


class AgronomyService(BaseService):
    """Read-only agronomy reasoning over a project.

    The service owns no state of its own — every method loads the project,
    authorizes the farmer, then delegates to the pure-function engine,
    matcher, or context builder.
    """

    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        catalog_repo: ProductCatalogRepository,
        content_repo: ProductNutrientContentRepository,
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.catalog_repo = catalog_repo
        self.content_repo = content_repo

    # ── authorization helper ────────────────────────────────────────────
    async def _get_authorized_project(
        self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID
    ) -> Project:
        """Resolve account → farmer profile → project (must belong to farmer)."""
        result = await db.execute(
            select(FarmerProfile).where(FarmerProfile.account_id == account_id)
        )
        profile = result.scalars().first()
        if not profile:
            raise AppException(ErrorCode.FARMER_PROFILE_NOT_FOUND)

        res = await db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.plant))
        )
        project = res.scalars().first()
        if not project or project.farmer_id != profile.id:
            raise AppException(ErrorCode.PROJECT_NOT_FOUND)
        return project

    # ── Method A: nutrient needs (UI: project page) ─────────────────────
    async def calculate_nutrient_needs(
        self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID
    ) -> dict:
        project = await self._get_authorized_project(db, project_id, account_id)
        needs = await calculate_stage_needs(db, project, include_all_stages=True)
        payload = needs_to_dict(needs)
        payload["project_id"] = str(project_id)
        return payload

    # ── Method A: product recommendations (UI: fertilizer page) ─────────
    async def recommend_products(
        self,
        db: AsyncSession,
        project_id: uuid.UUID,
        account_id: uuid.UUID,
        *,
        stage: str = "current",   # "current" | "overall"
    ) -> dict:
        project = await self._get_authorized_project(db, project_id, account_id)
        needs = await calculate_stage_needs(db, project, include_all_stages=(stage == "overall"))
        payload = await recommend_products(db, needs, project.farming_method, stage=stage)
        payload["project_id"] = str(project_id)
        return payload

    # ── Method B: AI / RAG context payload ──────────────────────────────
    async def build_context(
        self,
        db: AsyncSession,
        project_id: uuid.UUID,
        account_id: uuid.UUID | None = None,
        *,
        mode: str = "full",   # "full" | "compact" | "rag"
    ) -> dict:
        # Account may be None when called from internal code (e.g. Celery / the
        # ai module already verified ownership). When provided, we authorize.
        if account_id is not None:
            await self._get_authorized_project(db, project_id, account_id)
        return await build_project_context(db, project_id, mode=mode)

    # ── catalog browsing ────────────────────────────────────────────────
    async def get_product_catalog(
        self,
        db: AsyncSession,
        *,
        primary_nutrient: str | None = None,
        farming_method: str | None = None,
        product_type: str | None = None,
    ) -> list:
        return await self.catalog_repo.list_active(
            db,
            primary_nutrient=primary_nutrient,
            farming_method=farming_method,
            product_type=product_type,
        )
