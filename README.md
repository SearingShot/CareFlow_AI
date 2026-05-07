# CareFlow AI Healthcare Voice Assistant

CareFlow AI is a web-based front-desk voice agent for healthcare appointment operations. It listens to a user, understands appointment intent, calls backend tools, speaks responses back, animates a talking avatar, and produces an end-of-call summary.

Live frontend: https://careflow-ai-searingshot.vercel.app/

Backend health check: https://searingshot-careflow-ai-backend.hf.space/health

## Assignment Coverage

| Requirement | Implementation |
| --- | --- |
| Voice conversation | Browser SpeechRecognition for live dictation, MediaRecorder + Gemini fallback transcription, and browser SpeechSynthesis for spoken replies |
| 5+ exchanges with context | Frontend stores session ID and messages; backend keeps in-memory session history per session |
| Avatar | React/Framer Motion avatar changes states for idle, listening, thinking, and speaking |
| Tool calling | `identify_user`, `fetch_slots`, `book_appointment`, `retrieve_appointments`, `cancel_appointment`, `modify_appointment`, `end_conversation` |
| Visual tool activity | Latest tool call is shown in the right-side activity panel with status/details |
| Database | FastAPI + SQLAlchemy + SQLite appointments table |
| Double booking prevention | Booking checks existing booked appointment for the same date/time |
| Call summary | `/conversation/end` returns message count, timestamps, latest activity, and booked appointment details |

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: FastAPI, SQLAlchemy, SQLite
- AI: Gemini 2.5 Flash for intent response generation and fallback audio transcription
- Deployment: Vercel frontend, Hugging Face Spaces Docker backend

## Project Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- agents/          # Intent routing, prompts, tool implementations
|   |   |-- models/          # SQLAlchemy appointment model
|   |   |-- routes/          # Appointment and conversation APIs
|   |   |-- database.py
|   |   `-- main.py
|   |-- Dockerfile
|   |-- requirements.txt
|   `-- README.md
|-- frontend/
|   |-- src/
|   |   |-- components/      # Chat, voice controls, avatar, activity UI
|   |   |-- hooks/           # Chat, speech recognition, speech synthesis
|   |   `-- services/api.js
|   |-- package.json
|   `-- vercel.json
`-- DEPLOYMENT.md
```

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Required backend environment variables:

```text
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=sqlite:///./CareFlow.db
CORS_ORIGINS=http://localhost:5173,https://careflow-ai-searingshot.vercel.app
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

For local development, Vite proxies `/api` to `http://localhost:8000`. For deployed Vercel builds, set:

```text
VITE_API_BASE_URL=https://searingshot-careflow-ai-backend.hf.space
```

## API Overview

- `GET /health` - backend health check
- `POST /conversation/chat?user_message=...&session_id=...` - conversational agent turn
- `POST /conversation/transcribe` - fallback audio transcription
- `POST /conversation/end?session_id=...` - end call and generate summary
- `POST /appointments/identify` - identify user by phone number
- `GET /appointments/slots` - fetch available slots
- `POST /appointments/book` - book appointment
- `GET /appointments/retrieve` - retrieve appointments by phone number
- `POST /appointments/cancel` - cancel by appointment ID
- `POST /appointments/modify` - modify by appointment ID

## Demo Script

Use these prompts to demonstrate the required flow:

1. "My phone number is 9999999999 and my name is Utsav."
2. "What slots are available?"
3. "Book an appointment for Utsav, phone 9999999999, on 2026-05-10 at 4:00 PM."
4. "Show my appointments for 9999999999."
5. "Modify appointment 1 to 2026-05-11 at 6:00 PM."
6. "Cancel appointment 1."
7. Click "End Conversation" to show the summary.

## Known Notes

- If the Gemini quota is exhausted, the deployed backend still responds with a clear provider error and the non-AI appointment APIs remain available. Once the quota resets, the conversational route resumes without code changes.
- Browser voice recognition works best in Chrome or Edge with microphone permission enabled.
