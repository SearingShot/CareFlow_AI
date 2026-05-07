---
title: CareFlow AI Backend
emoji: 🩺
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# CareFlow AI Backend

FastAPI backend for the CareFlow AI healthcare voice assistant.

Deployment revision: 2026-05-07 submission build.

## Features

- Conversation endpoint backed by Gemini
- Appointment tools: identify user, fetch slots, book, retrieve, cancel, modify
- SQLite persistence through SQLAlchemy
- End conversation summary endpoint
- Docker-ready for Hugging Face Spaces

## Environment

```text
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=sqlite:///./CareFlow.db
CORS_ORIGINS=https://careflow-ai-searingshot.vercel.app
```

## Health Check

After deployment:

```text
https://searingshot-careflow-ai-backend.hf.space/health
```

## Local Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
