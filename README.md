# AI Fake News Detector

> MERN + FastAPI microservices platform for AI-powered fake news detection.

## Project Structure

| Directory | Description |
|---|---|
| `apps/web-client` | React user-facing application (Vite) |
| `apps/admin-dashboard` | React admin analytics dashboard (Vite) |
| `services/core-api` | Node.js + Express API gateway |
| `services/ai-inference` | FastAPI ML inference microservice |
| `shared/` | Shared constants and utilities |

## Getting Started

```bash
# Install Node dependencies (all workspaces)
npm install

# Install Python dependencies for AI service
pip install -r services/ai-inference/requirements.txt

# Run the full stack locally
npm run dev
```

## Environment Variables

Copy the `.env.example` files to `.env` in each service directory and fill in the values.

## Docker

```bash
docker-compose up --build
```
