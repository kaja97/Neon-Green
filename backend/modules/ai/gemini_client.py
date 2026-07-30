"""Gemini API Client — text-to-text generation for agriculture advice.

Uses the Google GenAI SDK (google-genai) to call Gemini.
All settings (model, temperature, max tokens) are pulled from config.py / .env.
"""
import logging
from config import settings
from .prompts import FALLBACK_RESPONSES, get_system_prompt

logger = logging.getLogger(__name__)


class GeminiClient:
    """Wrapper around the Google GenAI SDK for Gemini text generation.

    Configuration (from .env / config.py):
        GOOGLE_AI_STUDIO_API_KEY  — API key from https://aistudio.google.com/apikey
        GEMINI_MODEL              — Model name, e.g. "gemini-2.5-flash"
        GEMINI_TEMPERATURE        — Creativity (0.0 = factual, 1.0 = creative)
        GEMINI_MAX_OUTPUT_TOKENS  — Max response length
    """

    def __init__(self):
        self.api_key = settings.GOOGLE_AI_STUDIO_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.temperature = settings.GEMINI_TEMPERATURE
        self.max_output_tokens = settings.GEMINI_MAX_OUTPUT_TOKENS
        self._client = None

    def _is_configured(self) -> bool:
        """Check if a valid API key is set."""
        return bool(self.api_key) and self.api_key != "your-free-api-key"

    def _get_client(self):
        """Lazy-initialize the GenAI client."""
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    async def generate(
        self,
        context_json: str,
        message: str,
        intent: str,
        needs_calculation: bool = False,
    ) -> tuple[str, int]:
        """Send a question + project context to Gemini and get a text response.

        Args:
            context_json: JSON string of the farmer's project data
            message:      The farmer's question
            intent:       Classified intent (weather, disease, fertilizer, etc.)

        Returns:
            Tuple of (response_text, tokens_used)
        """
        if not self._is_configured():
            logger.info("Gemini API key not configured — returning fallback response")
            return FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"]), 0

        try:
            client = self._get_client()
            system_prompt = get_system_prompt(context_json, intent, needs_calculation)

            # Use generate_content with the configured model
            response = client.models.generate_content(
                model=self.model_name,
                contents=[
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_prompt}\n\nFarmer's question: {message}"}],
                    }
                ],
                config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_output_tokens,
                },
            )

            # Extract response text
            text = (
                response.text
                if response.text
                else FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"])
            )

            # Extract token usage
            tokens = 0
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                tokens = getattr(response.usage_metadata, "total_token_count", 0) or 0

            logger.info(
                "Gemini response OK | model=%s | tokens=%d | intent=%s",
                self.model_name, tokens, intent,
            )
            return text, tokens

        except Exception as e:
            logger.error("Gemini API error: %s", e, exc_info=True)
            return FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"]), 0


# ── Module-level singleton ──────────────────────────────────────────────────
_gemini_client: GeminiClient | None = None


def get_gemini_client() -> GeminiClient:
    """Get or create the singleton GeminiClient instance."""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client


async def call_gemini(
    context_json: str,
    message: str,
    intent: str,
    needs_calculation: bool = False,
) -> tuple[str, int]:
    """Convenience function — keeps backward compatibility with existing code.

    Delegates to GeminiClient.generate().
    """
    client = get_gemini_client()
    return await client.generate(context_json, message, intent, needs_calculation)
