import asyncio
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import db
from app.security import hash_password
from app.services.record_service import create_record
from datetime import datetime

async def seed():
    # users
    users = [
        {"email": "citizen@example.com", "password_hash": hash_password("password123"), "full_name": "Citizen One", "role": "citizen", "phone_number": "7795159602"},
        {"email": "officer@example.com", "password_hash": hash_password("password123"), "full_name": "Officer One", "role": "land_officer", "phone_number": "7795159602"},
        {"email": "admin@example.com", "password_hash": hash_password("password123"), "full_name": "Admin One", "role": "admin", "phone_number": "7795159602"},
    ]
    for u in users:
        await db["users"].update_one({"email": u["email"]}, {"$set": u}, upsert=True)
    officer = await db["users"].find_one({"email": "officer@example.com"})
    oid = str(officer["_id"])
    oemail = officer["email"]

    await db["land_records"].delete_many({})
    await db["record_versions"].delete_many({})
    await db["activity_events"].delete_many({})
    await db["alerts"].delete_many({})
    # records
    for i in range(20):
        data = {
            "survey_number": f"SV-{1000+i}",
            "property_location": f"Village {i}, Plot {i}",
            "district": "Anantapur" if i % 2 == 0 else "Kurnool",
            "state": "Andhra Pradesh",
            "area": 1000 + i * 50,
            "unit": "sqft",
            "owner_name": f"Owner {i}",
            "owner_phone": "7795159602",
            "registration_date": "2025-01-01",
            "status": "active",
        }
        await create_record(data, oid, oemail)

    # activity events + alerts
    from app.services.activity_service import log_event
    await log_event("login_failed", "attacker@example.com", None, None, {"simulated": True})
    await log_event("unauthorized_attempt", "attacker@example.com", None, None, {"simulated": True})

    print("Seed complete.")

if __name__ == "__main__":
    asyncio.run(seed())
