"""
Standardized response envelope helpers.
Every API response MUST use one of these functions.
"""
from typing import Any, Optional
from pydantic import BaseModel


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int


def success_response(data: Any) -> dict:
    """Wrap data in standard success envelope."""
    return {"success": True, "data": data, "meta": None}


def created_response(data: Any) -> dict:
    """Wrap data for 201 Created."""
    return {"success": True, "data": data, "meta": None}


def paginated_response(
    items: list, page: int, per_page: int, total: int
) -> dict:
    """Wrap list data with pagination metadata."""
    return {
        "success": True,
        "data": items,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


def message_response(message: str) -> dict:
    """Simple message response (e.g., for logout, OTP sent)."""
    return {"success": True, "data": {"message": message}, "meta": None}
