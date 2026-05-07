import os
import tempfile
from datetime import datetime, timezone
from uuid import uuid4

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.agent import process_conversation

router = APIRouter()
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# Lightweight in-memory sessions. Frontend also persists the session id locally.
conversation_sessions = {}


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def get_or_create_session(session_id: str | None):
    if not session_id:
        session_id = str(uuid4())

    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = {
            "session_id": session_id,
            "started_at": utc_now(),
            "ended_at": None,
            "history": [],
            "tool_events": [],
        }

    return conversation_sessions[session_id]


def build_summary(session):
    user_messages = [m for m in session["history"] if m["role"] == "user"]
    assistant_messages = [m for m in session["history"] if m["role"] == "assistant"]
    tool_events = session.get("tool_events", [])
    booked = [
        event["tool_result"]
        for event in tool_events
        if event.get("tool_name") == "book_appointment"
        and event.get("tool_result", {}).get("success")
    ]

    latest_activity = tool_events[-1] if tool_events else None
    summary_text = "No conversation messages were exchanged."
    if user_messages:
        latest_user_message = user_messages[-1]["content"]
        summary_text = (
            f"Handled {len(user_messages)} user message(s). "
            f"Latest user request: {latest_user_message}"
        )

    return {
        "session_id": session["session_id"],
        "started_at": session["started_at"],
        "ended_at": session.get("ended_at") or utc_now(),
        "message_count": len(user_messages) + len(assistant_messages),
        "short_summary": summary_text,
        "booked_appointments": booked,
        "latest_activity": latest_activity,
        "timestamps": {
            "started_at": session["started_at"],
            "ended_at": session.get("ended_at") or utc_now(),
        },
    }


@router.post("/chat")
def chat_with_agent(
    user_message: str,
    session_id: str | None = None,
    db: Session = Depends(get_db)
):

    session = get_or_create_session(session_id)
    conversation_history = session["history"]

    if user_message.strip().lower() in {
        "end conversation",
        "end the conversation",
        "finish conversation",
        "finish the conversation",
        "goodbye",
        "bye",
    }:
        return end_conversation(session["session_id"])

    # Process conversation through AI agent
    try:
        result = process_conversation(
            user_message=user_message,
            db=db,
            conversation_history=conversation_history
        )
    except Exception as exc:
        return {
            "session_id": session["session_id"],
            "response": (
                "The backend is running, but the AI provider call failed. "
                "Please check the Gemini API key and model access in the deployment settings."
            ),
            "tool_activity": None,
            "error": {
                "type": exc.__class__.__name__,
                "message": str(exc),
            },
        }

    # Save user message
    conversation_history.append({
        "role": "user",
        "content": user_message,
        "timestamp": utc_now()
    })

    # Save assistant response
    conversation_history.append({
        "role": "assistant",
        "content": result["response"],
        "timestamp": utc_now()
    })

    if result.get("tool_activity"):
        tool_event = {
            **result["tool_activity"],
            "timestamp": utc_now(),
        }
        session["tool_events"].append(tool_event)
        result["tool_activity"] = tool_event

    result["session_id"] = session["session_id"]
    return result


@router.post("/end")
def end_conversation(session_id: str | None = None):
    session = get_or_create_session(session_id)
    session["ended_at"] = utc_now()
    summary = build_summary(session)

    return {
        "session_id": session["session_id"],
        "response": "Conversation ended. I generated a short session summary for review.",
        "summary": summary,
        "tool_activity": {
            "tool_name": "end_conversation",
            "tool_result": {
                "success": True,
                "message": "Conversation summary generated.",
                "session_id": session["session_id"],
                "message_count": summary["message_count"],
            },
            "timestamp": utc_now(),
        },
    }


@router.post("/transcribe")
async def transcribe_voice_input(audio: UploadFile = File(...)):
    if not os.getenv("GEMINI_API_KEY"):
        return {
            "transcript": "",
            "error": "GEMINI_API_KEY is not configured for fallback transcription.",
        }

    suffix = os.path.splitext(audio.filename or "")[1] or ".webm"
    temp_path = None
    uploaded_file = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(await audio.read())

        uploaded_file = genai.upload_file(
            path=temp_path,
            mime_type=audio.content_type or "audio/webm",
        )
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content([
            "Transcribe this healthcare voice assistant user input. Return only the spoken words, no labels.",
            uploaded_file,
        ])

        return {
            "transcript": (response.text or "").strip(),
            "error": None,
        }
    except Exception as exc:
        return {
            "transcript": "",
            "error": f"Fallback transcription failed: {str(exc)}",
        }
    finally:
        if uploaded_file:
            try:
                genai.delete_file(uploaded_file.name)
            except Exception:
                pass
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
