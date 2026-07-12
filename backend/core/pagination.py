"""
Shared pagination dependency for list endpoints.
"""
from fastapi import Query
from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 20
    sort_by: str = "created_at"
    sort_order: str = "desc"

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page


def get_pagination(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
) -> PaginationParams:
    """FastAPI dependency for pagination query params."""
    return PaginationParams(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
    )
