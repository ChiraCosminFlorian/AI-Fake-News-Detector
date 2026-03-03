# app/api/health.py
# Purpose: FastAPI router for operational endpoints:
#   GET /health   → returns service status and model load status
#   GET /metrics  → returns prediction count, avg confidence, avg latency since last restart
