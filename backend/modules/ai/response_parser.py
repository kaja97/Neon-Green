import json
import re

def parse_ai_response(text: str) -> dict:
    """
    Attempts to extract actionable structured JSON from an AI response.
    Useful for Phase 6 intents that might create actual tasks or diagnosis records.
    If no JSON is found, returns the raw text under the 'text' key.
    """
    json_match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group(1))
            return {"text": text, "structured": data}
        except Exception:
            pass
            
    return {"text": text, "structured": None}
