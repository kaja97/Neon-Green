"""GeminiBackend — satisfies the ``AiBackend`` protocol from agronomy/interfaces.

Wraps the existing ``call_gemini`` free function so the ai/ module can
swap to a future ``LocalLlmBackend`` (Ollama / Llama) without touching
``AIService`` or ``ai_tasks.py``.

Usage in dependencies.py::

    from modules.agronomy.interfaces import AiBackend
    from modules.ai.gemini_backend import GeminiBackend

    def get_ai_backend() -> AiBackend:
        return GeminiBackend()
"""
from __future__ import annotations

import logging
from modules.ai.gemini_client import call_gemini

logger = logging.getLogger(__name__)


class GeminiBackend:
    """Synchronous wrapper so the protocol seam is in place now."""

    async def complete(
        self,
        context_json: str,
        message: str,
        intent: str,
    ) -> tuple[str, int]:
        return await call_gemini(context_json, message, intent)
