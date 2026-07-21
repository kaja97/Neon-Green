"""JWT validation for the chat service.

Uses the **same secret key** as the main AgriFarm backend. This service only
*validates* tokens — it never issues them. The ``sub`` claim contains the
main-app ``account_id`` (UUID string).
"""

import jwt
from fastapi import HTTPException, Depends, WebSocket
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings

security_scheme = HTTPBearer()


def decode_token(token: str) -> dict:
    """Validate a JWT issued by the main AgriFarm backend."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    """Extract account_id from JWT for REST endpoints."""
    payload = decode_token(credentials.credentials)
    account_id = payload.get("sub")
    if not account_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return account_id


async def ws_authenticate(websocket: WebSocket) -> str | None:
    """Extract and validate JWT from WebSocket query param ``?token=``."""
    token = websocket.query_params.get("token")
    if not token:
        return None
    try:
        payload = decode_token(token)
        return payload.get("sub")
    except Exception:
        return None
