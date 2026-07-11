import re

INTENT_PATTERNS = {
    "weather": r"\b(weather|rain|temperature|humidity|forecast|wind|storm|drought|frost)\b",
    "disease": r"\b(disease|blight|wilt|rot|fungus|pest|insect|yellow|spots|leaves|curling|mildew)\b",
    "fertilizer": r"\b(fertilizer|nutrient|npk|nitrogen|phosphorus|potassium|urea|compost|manure|feed)\b",
    "watering": r"\b(water|irrigation|irrigat|drought|moisture|dry|wet)\b",
    "harvest": r"\b(harvest|yield|pick|ready|mature|ripe)\b",
    "soil": r"\b(soil|ph|acidity|alkaline|organic matter|clay|sandy|loam)\b",
}

def classify_intent(message: str) -> str:
    message_lower = message.lower()
    scores = {}
    for intent, pattern in INTENT_PATTERNS.items():
        matches = re.findall(pattern, message_lower)
        if matches:
            scores[intent] = len(matches)
    
    if scores:
        return max(scores, key=scores.get)
    return "general"
