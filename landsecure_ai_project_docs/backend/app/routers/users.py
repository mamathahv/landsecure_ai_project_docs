from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from ..database import db
from ..routers.auth import get_current_user_id
from ..schemas.user import UserProfileUpdate
from ..services.activity_service import log_event

router = APIRouter(prefix="/users", tags=["users"])


async def current_user(user_id: str = Depends(get_current_user_id)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_roles(user, roles):
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")


@router.get("/me/profile")
async def get_profile(user=Depends(current_user)):
    """Get current user's profile including phone number."""
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "phone_number": user.get("phone_number"),
    }


@router.patch("/me/profile")
async def update_profile(payload: UserProfileUpdate, user=Depends(current_user)):
    """Update current user's profile (phone_number and/or full_name) and trigger security alteration logs."""
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    old_phone = user.get("phone_number")
    new_phone = updates.get("phone_number")

    await db["users"].update_one({"_id": user["_id"]}, {"$set": updates})
    updated = await db["users"].find_one({"_id": user["_id"]})

    # If phone number is altered/updated, log activity event & dispatch security alert
    if new_phone and new_phone != old_phone:
        await log_event(
            "phone_number_altered",
            user["email"],
            None,
            None,
            {"old_phone": old_phone, "new_phone": new_phone}
        )

    return {
        "id": str(updated["_id"]),
        "email": updated["email"],
        "full_name": updated["full_name"],
        "role": updated["role"],
        "phone_number": updated.get("phone_number"),
    }


@router.post("/me/test-phone-alert")
async def test_phone_alert(user=Depends(current_user)):
    """Dispatch a simulated SMS/phone alert notification to the user's phone number."""
    phone = user.get("phone_number")
    if not phone:
        raise HTTPException(status_code=400, detail="No phone number configured. Please update your phone number first.")
    
    doc, alert = await log_event(
        "phone_number_altered",
        user["email"],
        None,
        None,
        {"old_phone": phone, "new_phone": phone, "test_dispatch": True}
    )
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    if alert and "_id" in alert:
        alert["id"] = str(alert.pop("_id"))
    return {
        "status": "dispatched",
        "recipient_phone": phone,
        "message": f"Test security alert SMS dispatched to +91-{phone}.",
        "event_id": str(doc.get("id")),
        "alert": alert
    }


@router.get("")
async def list_users(skip: int = 0, limit: int = Query(50, le=200), user=Depends(current_user)):
    require_roles(user, ["admin"])
    cursor = db["users"].find().skip(skip).limit(limit)
    items = []
    async for d in cursor:
        d["id"] = str(d.pop("_id"))
        d.pop("password_hash", None)
        items.append(d)
    total = await db["users"].count_documents({})
    return {"items": items, "total": total}


@router.patch("/{user_id}/role")
async def update_role(user_id: str, payload: dict, user=Depends(current_user)):
    require_roles(user, ["admin"])
    role = payload.get("role")
    if role not in ("citizen", "land_officer", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    res = await db["users"].update_one({"_id": oid}, {"$set": {"role": role}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user_id, "role": role}
