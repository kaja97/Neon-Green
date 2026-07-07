"""Shared helpers for resolving farmer profiles and project ownership."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.account import FarmerProfile
from models.project import Project


async def get_farmer_profile(db: AsyncSession, account_id: UUID) -> FarmerProfile:
    result = await db.execute(
        select(FarmerProfile).where(FarmerProfile.account_id == account_id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return profile


async def get_owned_project(
    db: AsyncSession, project_id: UUID, account_id: UUID
) -> tuple[Project, FarmerProfile]:
    profile = await get_farmer_profile(db, account_id)
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != profile.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project, profile
