# app/main.py
# Purpose: FastAPI application entry point
#   - Loads the trained TF-IDF + LogReg model once at startup
#   - Exposes POST /predict for fake-news classification

import os
import joblib
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ── Paths ───────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml_models", "model.pkl")

# ── Request / Response schemas ──────────────────────────────

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    label: str        # "fake" or "real"
    confidence: float  # 0.0 – 1.0

# ── Model holder (loaded once at startup) ───────────────────
ml_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model when the server starts, release on shutdown."""
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Model file not found at {MODEL_PATH}. "
            "Run  python training/train.py  first."
        )
    ml_model["pipeline"] = joblib.load(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
    yield
    ml_model.clear()

# ── FastAPI app ─────────────────────────────────────────────
app = FastAPI(
    title="AI Fake News Detector – Inference Service",
    version="1.0.0",
    lifespan=lifespan,
)

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """Classify a news article as fake or real."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    pipeline = ml_model["pipeline"]

    # predict_proba returns [[prob_real, prob_fake]]
    probabilities = pipeline.predict_proba([request.text])[0]
    predicted_class = int(probabilities.argmax())   # 0 = real, 1 = fake

    label = "fake" if predicted_class == 1 else "real"
    confidence = round(float(probabilities[predicted_class]), 4)

    return PredictResponse(label=label, confidence=confidence)
