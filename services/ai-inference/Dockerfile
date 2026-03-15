FROM python:3.11-slim

WORKDIR /app

COPY services/ai-inference/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/ai-inference/ .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
