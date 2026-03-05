# app/main.py
# Purpose: FastAPI application entry point
#   - Loads the trained TF-IDF + LogReg model once at startup
#   - Computes SHAP explanations for each prediction
#   - Exposes POST /predict for fake-news classification

import os
import joblib
import numpy as np
import shap
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ── Paths ───────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml_models", "model.pkl")

# ── Request / Response schemas ──────────────────────────────

class HighlightWord(BaseModel):
    word: str
    score: float  # SHAP value (higher = more influential)

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    label: str            # "fake" or "real"
    confidence: float     # 0.0 – 1.0
    highlights: list[HighlightWord]  # top influential words

# ── Model holder (loaded once at startup) ───────────────────
ml_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model and SHAP explainer when the server starts."""
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Model file not found at {MODEL_PATH}. "
            "Run  python training/train.py  first."
        )

    pipeline = joblib.load(MODEL_PATH)
    ml_model["pipeline"] = pipeline

    # Extract the TF-IDF vectorizer and classifier from the pipeline
    tfidf = pipeline.named_steps["tfidf"]
    clf = pipeline.named_steps["clf"]

    # Create a SHAP LinearExplainer using the classifier coefficients
    # masker uses the mean of the training feature distribution (zeros for sparse TF-IDF)
    masker = shap.maskers.Independent(
        data=np.zeros((1, len(tfidf.vocabulary_))),
    )
    explainer = shap.LinearExplainer(clf, masker=masker)
    ml_model["tfidf"] = tfidf
    ml_model["explainer"] = explainer

    print(f"Model + SHAP explainer loaded from {MODEL_PATH}")
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
    """Classify a news article as fake or real, with SHAP explanations."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    pipeline = ml_model["pipeline"]
    tfidf = ml_model["tfidf"]
    explainer = ml_model["explainer"]

    # 1. Predict
    probabilities = pipeline.predict_proba([request.text])[0]
    predicted_class = int(probabilities.argmax())  # 0 = real, 1 = fake
    label = "fake" if predicted_class == 1 else "real"
    confidence = round(float(probabilities[predicted_class]), 4)

    # 2. SHAP explanation
    text_tfidf = tfidf.transform([request.text])
    shap_values = explainer.shap_values(text_tfidf)

    # shap_values shape: (1, n_features) for binary or (1, n_features, 2)
    if isinstance(shap_values, list):
        # Use SHAP values for the predicted class
        sv = shap_values[predicted_class][0]
    elif shap_values.ndim == 3:
        sv = shap_values[0, :, predicted_class]
    else:
        sv = shap_values[0]

    # 3. Map non-zero SHAP values back to words
    feature_names = tfidf.get_feature_names_out()
    nonzero_indices = text_tfidf[0].nonzero()[1]

    word_scores = []
    for idx in nonzero_indices:
        word_scores.append((feature_names[idx], float(abs(sv[idx]))))

    # Sort by absolute SHAP score descending, take top 10
    word_scores.sort(key=lambda x: x[1], reverse=True)
    highlights = [
        HighlightWord(word=w, score=round(s, 4))
        for w, s in word_scores[:10]
    ]

    return PredictResponse(label=label, confidence=confidence, highlights=highlights)
