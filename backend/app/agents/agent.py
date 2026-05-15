import json
import os

import google.generativeai as genai

from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.agents.prompts import SYSTEM_PROMPT

from app.agents.tools import (
    identify_user,
    fetch_slots,
    book_appointment,
    retrieve_appointments,
    cancel_appointment,
    modify_appointment
)

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash-lite")

TOOLS = {
    "identify_user": identify_user,
    "fetch_slots": fetch_slots,
    "book_appointment": book_appointment,
    "retrieve_appointments": retrieve_appointments,
    "cancel_appointment": cancel_appointment,
    "modify_appointment": modify_appointment
}


def detect_intent(user_message: str):

    message = user_message.lower()

    if "cancel" in message:
        return "cancel_appointment"

    elif "modify" in message or "change" in message:
        return "modify_appointment"

    elif "identify" in message or "phone number" in message or "my number is" in message:
        return "identify_user"

    elif "slot" in message or "available" in message or "availability" in message:
        return "fetch_slots"

    elif "show my appointments" in message or "retrieve appointments" in message or "my appointments" in message:
        return "retrieve_appointments"

    elif "book" in message or "schedule" in message:
        return "book_appointment"

    return "normal"



def process_conversation(
    user_message: str,
    db: Session,
    conversation_history=None,
    session=None
):
    conversation_history = conversation_history or []
    session = session or {}

    user_memory = session.get("user_memory", {})
    pending_action = session.get("pending_action")
    pending_data = session.get("pending_data", {})

    intent = detect_intent(user_message)
    recent_history = conversation_history[-8:]

    # FETCH SLOTS
    if intent == "fetch_slots":

        tool_result = fetch_slots()

        final_prompt = f"""
{SYSTEM_PROMPT}

Available slots:
{json.dumps(tool_result)}

Generate a brief helpful response that lists the available times and asks what the user prefers.
"""

        final_response = model.generate_content(final_prompt)

        return {
            "response": final_response.text,
            "tool_activity": {
                "tool_name": "fetch_slots",
                "tool_result": tool_result
            }
        }

    # IDENTIFY USER
    elif intent == "identify_user":

        extraction_prompt = f"""
Extract the user's name and phone number from the user message or recent conversation.

Return ONLY valid JSON.

Required fields:
- phone_number

Optional fields:
- name

User message:
{user_message}

Recent conversation:
{json.dumps(recent_history)}

Example format:
{{
    "name": "Utsav",
    "phone_number": "9999999999"
}}
"""

        extraction_response = model.generate_content(extraction_prompt)

        extraction_text = extraction_response.text.strip()

        extraction_text = extraction_text.replace("```json", "")
        extraction_text = extraction_text.replace("```", "")

        try:

            extracted_data = json.loads(extraction_text)

            if extracted_data.get("name"):
                session["user_memory"]["name"] = extracted_data.get("name")

            if extracted_data.get("phone_number"):
                session["user_memory"]["phone_number"] = extracted_data.get("phone_number")

            tool_result = identify_user(
                **extracted_data
            )

            return {
                "response": "Thanks, I will use that phone number to manage your appointments.",
                "tool_activity": {
                    "tool_name": "identify_user",
                    "tool_result": tool_result
                }
            }

        except Exception as e:

            return {
                "response": f"Could not identify the user properly. Error: {str(e)}",
                "tool_activity": None
            }

    # BOOK APPOINTMENT
    elif intent == "book_appointment":

        extraction_prompt = f"""
Extract the following details from the user message.

Return ONLY valid JSON.

Required fields:
- name
- phone_number
- appointment_date
- appointment_time

User message:
{user_message}

Recent conversation:
{json.dumps(recent_history)}

Example format:
{{
    "name": "Utsav",
    "phone_number": "9999999999",
    "appointment_date": "2026-05-10",
    "appointment_time": "4:00 PM"
}}
"""

        extraction_response = model.generate_content(extraction_prompt)

        extraction_text = extraction_response.text.strip()

        # Remove markdown if Gemini adds it
        extraction_text = extraction_text.replace("```json", "")
        extraction_text = extraction_text.replace("```", "")

        try:

            extracted_data = json.loads(extraction_text)

            if not extracted_data.get("name"):
                extracted_data["name"] = user_memory.get("name")

            if not extracted_data.get("phone_number"):
                extracted_data["phone_number"] = user_memory.get("phone_number")

            required_fields = [
                "name",
                "phone_number",
                "appointment_date",
                "appointment_time"
            ]

            missing_fields = []

            for field in required_fields:

                if not extracted_data.get(field):
                    missing_fields.append(field)

            if missing_fields:

                missing_text = ", ".join(missing_fields)

                return {
                    "response": f"I still need the following details to book your appointment: {missing_text}.",
                    "tool_activity": None
                }

            tool_result = book_appointment(
                db=db,
                **extracted_data
            )

            final_prompt = f"""
{SYSTEM_PROMPT}

Tool result:
{json.dumps(tool_result)}

Generate a concise appointment booking response. If successful, include the appointment date and time.
"""

            final_response = model.generate_content(final_prompt)

            return {
                "response": final_response.text,
                "tool_activity": {
                    "tool_name": "book_appointment",
                    "tool_result": tool_result
                }
            }

        except Exception as e:

            return {
                "response": f"Could not extract booking details properly. Error: {str(e)}",
                "tool_activity": None
            }


    # RETRIEVE APPOINTMENTS
    elif intent == "retrieve_appointments":

        extraction_prompt = f"""
Extract the phone number from the user message.

Return ONLY valid JSON.

Example:
{{
    "phone_number": "9999999999"
}}

User message:
{user_message}

Recent conversation:
{json.dumps(recent_history)}
"""

        extraction_response = model.generate_content(extraction_prompt)

        extraction_text = extraction_response.text.strip()

        extraction_text = extraction_text.replace("```json", "")
        extraction_text = extraction_text.replace("```", "")

        try:

            extracted_data = json.loads(extraction_text)

            tool_result = retrieve_appointments(
                db=db,
                **extracted_data
            )

            final_prompt = f"""
{SYSTEM_PROMPT}

Tool result:
{json.dumps(tool_result)}

Generate a concise response summarizing the appointment list or explaining that none were found.
"""

            final_response = model.generate_content(final_prompt)

            return {
                "response": final_response.text,
                "tool_activity": {
                    "tool_name": "retrieve_appointments",
                    "tool_result": tool_result
                }
            }

        except Exception as e:

            return {
                "response": f"Could not retrieve appointments. Error: {str(e)}",
                "tool_activity": None
            }
        
    # CANCEL APPOINTMENT
    elif intent == "cancel_appointment":

        extraction_prompt = f"""
Extract the appointment ID from the user message.

Return ONLY valid JSON.

Example:
{{
    "appointment_id": 3
}}

User message:
{user_message}

Recent conversation:
{json.dumps(recent_history)}
"""

        extraction_response = model.generate_content(extraction_prompt)

        extraction_text = extraction_response.text.strip()

        extraction_text = extraction_text.replace("```json", "")
        extraction_text = extraction_text.replace("```", "")

        try:

            extracted_data = json.loads(extraction_text)

            tool_result = cancel_appointment(
                db=db,
                **extracted_data
            )

            return {
                "response": tool_result["message"],
                "tool_activity": {
                    "tool_name": "cancel_appointment",
                    "tool_result": tool_result
                }
            }

        except Exception as e:

            return {
                "response": f"Could not cancel appointment. Error: {str(e)}",
                "tool_activity": None
            }
    
    # MODIFY APPOINTMENT
    elif intent == "modify_appointment":

        extraction_prompt = f"""
Extract the following details from the user message.

Return ONLY valid JSON.

Required:
- appointment_id
- new_date
- new_time

Example:
{{
    "appointment_id": 3,
    "new_date": "2026-05-20",
    "new_time": "6:00 PM"
}}

User message:
{user_message}

Recent conversation:
{json.dumps(recent_history)}
"""

        extraction_response = model.generate_content(extraction_prompt)

        extraction_text = extraction_response.text.strip()

        extraction_text = extraction_text.replace("```json", "")
        extraction_text = extraction_text.replace("```", "")

        try:

            extracted_data = json.loads(extraction_text)

            tool_result = modify_appointment(
                db=db,
                **extracted_data
            )

            return {
                "response": tool_result["message"],
                "tool_activity": {
                    "tool_name": "modify_appointment",
                    "tool_result": tool_result
                }
            }

        except Exception as e:

            return {
                "response": f"Could not modify appointment. Error: {str(e)}",
                "tool_activity": None
            }

    # NORMAL RESPONSE
    else:

        normal_prompt = SYSTEM_PROMPT + f"""

Recent conversation:
{json.dumps(recent_history)}

User message:
{user_message}
"""

        response = model.generate_content(normal_prompt)

        return {
            "response": response.text,
            "tool_activity": None
        }
