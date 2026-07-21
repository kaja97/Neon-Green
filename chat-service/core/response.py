"""Standardised API response envelope — matches main backend pattern."""

from typing import Any


def success_response(data: Any, meta: dict | None = None) -> dict:
    resp: dict[str, Any] = {"success": True, "data": data}
    if meta:
        resp["meta"] = meta
    return resp
