from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from ..database import db
from ..security import hash_password


def get_users_collection():
    return db["users"]


async def get_user_by_email(email: str):
    if not email:
        return None
    return await get_users_collection().find_one({"email": email.strip().lower()})


async def create_user(email: str, password: str, full_name: str, role: str = "citizen", phone_number: str | None = None):
    clean_email = email.strip().lower()
    existing = await get_user_by_email(clean_email)
    if existing:
        return None
    doc = {
        "email": clean_email,
        "password_hash": hash_password(password),
        "full_name": full_name.strip(),
        "role": role.strip().lower(),
        "phone_number": phone_number.strip() if isinstance(phone_number, str) and phone_number.strip() else None,
    }
    try:
        result = await get_users_collection().insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc
    except DuplicateKeyError:
        return None
    except Exception:
        return None
