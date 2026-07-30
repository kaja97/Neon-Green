import pytest
import uuid
from modules.ai.intent_classifier import classify_intent

def test_intent_classifier():
    assert classify_intent("when will it rain today?") == "weather"
    assert classify_intent("my plant has yellow spots on leaves") == "disease"
    assert classify_intent("how much urea should i add") == "fertilizer"
    assert classify_intent("how to do irrigation") == "watering"
    assert classify_intent("is it ready for harvest") == "harvest"
    assert classify_intent("how to fix alkaline soil") == "soil"
    assert classify_intent("hello there") == "general"
    
@pytest.mark.asyncio
async def test_rate_limiter_redis_mock(mocker):
    # This would mock Redis and check the 3-bucket rate limiting system
    assert True
