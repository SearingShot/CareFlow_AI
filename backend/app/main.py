import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.appointment import Appointment
from app.routes.appointments import router as appointment_router
from app.routes.conversation import router as conversation_router

app = FastAPI(
    title="CareFlow",
    description="AI-powered healthcare voice assistant",
    version="1.0.0"
)

# Create database tables
Base.metadata.create_all(bind=engine)

app.include_router(
    appointment_router,
    prefix="/appointments",
    tags=["Appointments"]
)

app.include_router(
    conversation_router,
    prefix="/conversation",
    tags=["Conversation"]
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials="*" not in allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "CareFlow AI Backend Running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }
