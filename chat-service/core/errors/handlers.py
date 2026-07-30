"""Global exception handlers for the FastAPI app."""

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .exceptions import ChatException


async def chat_exception_handler(request: Request, exc: ChatException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {"message": exc.detail, "code": exc.status_code},
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for error in exc.errors():
        field = " → ".join(str(loc) for loc in error["loc"])
        details.append({"field": field, "message": error["msg"]})
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "message": "Validation error",
                "code": 422,
                "details": details,
            },
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {"message": "Internal server error", "code": 500},
        },
    )
