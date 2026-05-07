from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.tools import (
    identify_user,
    fetch_slots,
    book_appointment,
    retrieve_appointments,
    cancel_appointment,
    modify_appointment
)

router = APIRouter()


@router.post("/identify")
def identify_patient(
    phone_number: str,
    name: str | None = None
):
    return identify_user(
        phone_number=phone_number,
        name=name
    )


@router.get("/slots")
def get_slots():
    return fetch_slots()


@router.post("/book")
def create_appointment(
    name: str,
    phone_number: str,
    appointment_date: str,
    appointment_time: str,
    db: Session = Depends(get_db)
):
    return book_appointment(
        db=db,
        name=name,
        phone_number=phone_number,
        appointment_date=appointment_date,
        appointment_time=appointment_time
    )

@router.get("/retrieve")
def get_appointments(
    phone_number: str,
    db: Session = Depends(get_db)
):
    return retrieve_appointments(
        db=db,
        phone_number=phone_number
    )


@router.post("/cancel")
def cancel_existing_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    return cancel_appointment(
        db=db,
        appointment_id=appointment_id
    )


@router.post("/modify")
def modify_existing_appointment(
    appointment_id: int,
    new_date: str,
    new_time: str,
    db: Session = Depends(get_db)
):
    return modify_appointment(
        db=db,
        appointment_id=appointment_id,
        new_date=new_date,
        new_time=new_time
    )
