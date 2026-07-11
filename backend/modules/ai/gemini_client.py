import logging
from config import settings
from .prompts import FALLBACK_RESPONSES, get_system_prompt

logger = logging.getLogger(__name__)

async def call_gemini(context_json: str, message: str, intent: str) -> tuple[str, int]:
    """Call Gemini API with project context. Returns (response, tokens_used)."""
    api_key = settings.GOOGLE_AI_STUDIO_API_KEY
    
    if not api_key or api_key == "your-free-api-key":
        logger.info("Using AI fallback due to missing API key")
        return FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"]), 0
    
    try:
        from google import genai
        
        client = genai.Client(api_key=api_key)
        system_prompt = get_system_prompt(context_json)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\nFarmer's question: {message}"}]}
            ]
        )
        
        text = response.text if response.text else FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"])
        tokens = response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') and response.usage_metadata else 0
        return text, tokens
        
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"]), 0
