"""Abstraction interfaces for the AI / context layer (RAG-readiness seam).

These protocols let the agronomy module's context output and the AI caller
vary independently:

  • ``ContextProvider`` — today satisfied by :class:`AgronomyService`
    (build_context); a future vector-DB-backed provider can implement the
    same protocol and be swapped in via the factory.

  • ``AiBackend`` — today satisfied by :class:`GeminiBackend`; a future
    ``LocalLlmBackend`` (Ollama / Llama) implements the same protocol and
    is selected via ``settings.AI_BACKEND`` with no other code changes.

The goal is to make the future local-LLM / RAG migration a *drop-in*: only
a new class + a one-line factory change.
"""
from __future__ import annotations

from typing import Protocol, runtime_checkable
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession


@runtime_checkable
class ContextProvider(Protocol):
    """Builds a structured project context payload for AI / RAG consumption."""

    async def build_context(
        self,
        db: AsyncSession,
        project_id: UUID,
        account_id: UUID | None = None,
        *,
        mode: str = "full",
    ) -> dict: ...


@runtime_checkable
class AiBackend(Protocol):
    """Calls an LLM with a project context payload and a user message.

    Implementations:
      • ``GeminiBackend``  — calls Google Gemini (current default)
      • ``LocalLlmBackend`` — future: calls a local Ollama / Llama model
    """

    async def complete(
        self,
        context_json: str,
        message: str,
        intent: str,
    ) -> tuple[str, int]:
        """Return (response_text, tokens_used)."""
        ...


__all__ = ["ContextProvider", "AiBackend"]
