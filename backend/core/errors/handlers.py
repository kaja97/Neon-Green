from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .exceptions import AppException
from .error_codes import ErrorCode
from .messages import ERROR_MESSAGES
import logging

logger = logging.getLogger("agrifarm")


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle all AppException — return structured error envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "error": exc.detail,
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic v2 validation errors — restructure into standard envelope."""
    errors = []
    for err in exc.errors():
        field = " → ".join(str(loc) for loc in err["loc"])
        errors.append({"field": field, "message": err["msg"]})

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": ErrorCode.VALIDATION_ERROR.value,
                "message": "Request validation failed.",
                "details": errors,
            },
        },
    )


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Last-resort handler. Log full traceback, return generic 500."""
    logger.exception(
        "Unhandled exception on %s %s: %s",
        request.method, request.url.path, exc,
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": ErrorCode.INTERNAL_SERVER_ERROR.value,
                "message": ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR],
            },
        },
    )
