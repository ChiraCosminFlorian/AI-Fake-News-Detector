# app/api/predict.py
# Purpose: FastAPI router for prediction endpoints:
#   POST /predict/text  → accepts raw text, runs NLP model, returns verdict + confidence + highlights
#   POST /predict/url   → fetches article from URL, runs model, returns same schema
