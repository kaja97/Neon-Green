from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select, func
from core.base_repository import BaseRepository
from models.issue import ProjectIssue
from models.comment import IssueComment
from models.account import FarmerProfile
from models.plant_health import DiseaseSolution
import uuid


class ProjectIssueRepository(BaseRepository[ProjectIssue, None, None]):
    def __init__(self):
        super().__init__(ProjectIssue)

    async def get_by_project(self, db: AsyncSession, project_id: uuid.UUID):
        result = await db.execute(
            select(self.model)
            .where(self.model.project_id == project_id)
            .order_by(self.model.reported_date.desc())
        )
        return result.scalars().all()


class IssueCommentRepository(BaseRepository[IssueComment, None, None]):
    def __init__(self):
        super().__init__(IssueComment)

    async def get_by_issue(self, db: AsyncSession, issue_id: uuid.UUID) -> list[IssueComment]:
        """Flat fetch of all comments for an issue, oldest first."""
        result = await db.execute(
            select(self.model)
            .where(self.model.issue_id == issue_id)
            .order_by(self.model.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_authors(self, db: AsyncSession, author_ids: list[uuid.UUID]) -> list[FarmerProfile]:
        """Bulk-load FarmerProfile rows for a set of author IDs (avoids N+1)."""
        if not author_ids:
            return []
        result = await db.execute(
            select(FarmerProfile).where(FarmerProfile.id.in_(author_ids))
        )
        return list(result.scalars().all())

    async def count_by_issue(self, db: AsyncSession, issue_id: uuid.UUID) -> int:
        """Total comment count for an issue (used in feed enrichment)."""
        result = await db.execute(
            select(func.count()).where(self.model.issue_id == issue_id)
        )
        return result.scalar() or 0


class DiseaseSolutionRepository(BaseRepository[DiseaseSolution, None, None]):
    def __init__(self):
        super().__init__(DiseaseSolution)

    async def get_by_disease_and_methods(self, db: AsyncSession, disease_id: uuid.UUID, methods: list[str]):
        result = await db.execute(
            select(self.model).where(
                self.model.disease_id == disease_id,
                self.model.farming_method.in_(methods)
            )
        )
        return result.scalars().all()
