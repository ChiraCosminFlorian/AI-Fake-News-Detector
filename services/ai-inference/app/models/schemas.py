# app/models/schemas.py
# Purpose: Pydantic request/response schemas:
#   TextPredictionRequest  → { text: str }
#   UrlPredictionRequest   → { url: str }
#   PredictionResponse     → { verdict: str, confidence: float, highlights: list[HighlightSpan] }
#   HighlightSpan          → { start: int, end: int, word: str, influence: float }
