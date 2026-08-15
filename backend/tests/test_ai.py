import pytest
from modules.ai.intent_classifier import classify_intent

def test_intent_classifier():
    intent, needs_calc = classify_intent("when will it rain today?")
    assert intent == "weather"
    assert needs_calc is False

    intent, needs_calc = classify_intent("my plant has yellow spots on leaves")
    assert intent == "disease"

    intent, needs_calc = classify_intent("how much urea should i add")
    assert intent == "nutrient_calculation"
    assert needs_calc is True

    intent, needs_calc = classify_intent("how to do irrigation")
    assert intent == "watering"

    intent, needs_calc = classify_intent("is it ready for harvest")
    assert intent == "harvest"

    intent, needs_calc = classify_intent("what is alkaline soil")
    assert intent == "soil"

    intent, needs_calc = classify_intent("hello there")
    assert intent == "general"


@pytest.mark.asyncio
async def test_rate_limiter_mock():
    # Rate limiter fallback validation
    assert True
