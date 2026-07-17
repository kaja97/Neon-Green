import logging
import httpx
from typing import Any, Dict, Optional
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode

class BaseAPIClient:
    """
    Base API client class for external HTTP communications.
    Provides standard get/post methods, error wrapping, and timeout handling.
    """
    
    def __init__(self, base_url: str, timeout: float = 10.0):
        self.base_url = base_url
        self.timeout = timeout
        self.logger = logging.getLogger(f"agrifarm.clients.{self.__class__.__name__}")

    async def _handle_response(self, response: httpx.Response) -> Any:
        try:
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            self.logger.error(f"HTTP error from {exc.request.url}: {exc.response.status_code} - {exc.response.text}")
            raise AppException(ErrorCode.EXTERNAL_API_ERROR, details=exc.response.text)
        except Exception as exc:
            self.logger.error(f"Error parsing response: {exc}")
            raise AppException(ErrorCode.EXTERNAL_API_ERROR)

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        url = f"{self.base_url}{endpoint}"
        self.logger.debug(f"GET Request to {url}")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params, headers=headers)
                return await self._handle_response(response)
        except httpx.RequestError as exc:
            self.logger.error(f"Request Error to {url}: {exc}")
            raise AppException(ErrorCode.EXTERNAL_API_ERROR, details="Connection failed")

    async def post(self, endpoint: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        url = f"{self.base_url}{endpoint}"
        self.logger.debug(f"POST Request to {url}")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=json, headers=headers)
                return await self._handle_response(response)
        except httpx.RequestError as exc:
            self.logger.error(f"Request Error to {url}: {exc}")
            raise AppException(ErrorCode.EXTERNAL_API_ERROR, details="Connection failed")
