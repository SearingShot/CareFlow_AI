from sqlalchemy.orm import Session
from app.models.appointment import Appointment


# Hardcoded slots for MVP
AVAILABLE_SLOTS = [
    "10:00 AM",
    "11:00 AM",
    "2:00 PM",
    "4:00 PM",
    "6:00 PM"
]


def identify_user(phone_number: str, name: str | None = None):
    return {
        "success": True,
        "message": "User identified successfully.",
        "user": {
            "name": name,
            "phone_number": phone_number,
        }
    }


def fetch_slots():
    return {
        "available_slots": AVAILABLE_SLOTS
    }


def book_appointment(
    db: Session,
    name: str,
    phone_number: str,
    appointment_date: str,
    appointment_time: str
):
    
    # Check if slot already booked
    existing_appointment = db.query(Appointment).filter(
        Appointment.appointment_date == appointment_date,
        Appointment.appointment_time == appointment_time,
        Appointment.status == "booked"
    ).first()

    if existing_appointment:
        return {
            "success": False,
            "message": "This slot is already booked."
        }

    # Create appointment
    new_appointment = Appointment(
        name=name,
        phone_number=phone_number,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        status="booked"
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return {
        "success": True,
        "message": "Appointment booked successfully.",
        "appointment": {
            "id": new_appointment.id,
            "name": new_appointment.name,
            "date": new_appointment.appointment_date,
            "time": new_appointment.appointment_time
        }
    }

def retrieve_appointments(
    db: Session,
    phone_number: str
):

    appointments = db.query(Appointment).filter(
        Appointment.phone_number == phone_number,
        Appointment.status == "booked"
    ).all()

    if not appointments:
        return {
            "success": False,
            "message": "No appointments found."
        }

    return {
        "success": True,
        "appointments": [
            {
                "id": appointment.id,
                "name": appointment.name,
                "date": appointment.appointment_date,
                "time": appointment.appointment_time,
                "status": appointment.status
            }
            for appointment in appointments
        ]
    }


def cancel_appointment(
    db: Session,
    appointment_id: int
):

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        return {
            "success": False,
            "message": "Appointment not found."
        }

    appointment.status = "cancelled"

    db.commit()

    return {
        "success": True,
        "message": "Appointment cancelled successfully."
    }


def modify_appointment(
    db: Session,
    appointment_id: int,
    new_date: str,
    new_time: str
):

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        return {
            "success": False,
            "message": "Appointment not found."
        }

    # Check if new slot already booked
    existing_slot = db.query(Appointment).filter(
        Appointment.appointment_date == new_date,
        Appointment.appointment_time == new_time,
        Appointment.status == "booked"
    ).first()

    if existing_slot:
        return {
            "success": False,
            "message": "Requested slot is already booked."
        }

    appointment.appointment_date = new_date
    appointment.appointment_time = new_time

    db.commit()

    return {
        "success": True,
        "message": "Appointment modified successfully.",
        "updated_appointment": {
            "id": appointment.id,
            "date": appointment.appointment_date,
            "time": appointment.appointment_time
        }
    }
