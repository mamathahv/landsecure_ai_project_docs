from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from ..schemas.record import LandRecordCreate, LandRecordUpdate, LandRecordOut
from ..services.record_service import (
    create_record, get_record, list_records, update_record, get_history, verify_integrity, canonical_hash,
)
from ..routers.auth import get_current_user_id
from ..database import db

router = APIRouter(prefix="/records", tags=["records"])


async def current_user(user_id: str = Depends(get_current_user_id)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_roles(user, roles):
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")


@router.post("", response_model=LandRecordOut, status_code=201)
async def create(payload: LandRecordCreate, user=Depends(current_user)):
    require_roles(user, ["land_officer", "admin"])
    doc = await create_record(payload.model_dump(), str(user["_id"]), user["email"])
    return _to_out(doc)


@router.get("")
async def list_all(
    skip: int = 0,
    limit: int = Query(20, le=100),
    search: str | None = None,
    district: str | None = None,
    user=Depends(current_user),
):
    items, total = await list_records(skip, limit, search, district)
    return {"items": [_to_out(d) for d in items], "total": total, "skip": skip, "limit": limit}


@router.get("/{record_id}", response_model=LandRecordOut)
async def get_one(record_id: str, user=Depends(current_user)):
    from ..services.activity_service import log_event
    from ..config import settings
    from datetime import datetime, timezone

    doc = await get_record(record_id)
    now_utc = datetime.now(timezone.utc)
    formatted_dt = now_utc.strftime("%Y-%m-%d %H:%M:%S UTC")

    if not doc:
        # Trigger SMS alert to mobile number 7795159602 for failed/unauthorized land record access attempt
        await log_event(
            event_type="record_access_failed",
            user_email=user["email"] if user else "unauthorized",
            record_id=record_id,
            features={"failed_login_count": 0, "requests_per_minute": 5, "access_outside_normal_hours": 0, "permission_mismatch": 1, "records_modified_short_period": 0, "repeated_requests_same_source": 1, "hash_mismatch": 0, "auth_result": 0},
            metadata={
                "record_id": record_id,
                "accessed_by": user["email"] if user else "unauthorized",
                "user_role": user.get("role") if user else "unknown",
                "phone_number": settings.SECURITY_ALERT_PHONE_NUMBER,
                "formatted_datetime": formatted_dt,
                "status": "failed_not_found",
            }
        )
        raise HTTPException(status_code=404, detail="Record not found")

    # Trigger real-time SMS alert to mobile number 7795159602 with full access details, date, and time
    _, alert = await log_event(
        event_type="record_access",
        user_email=user["email"],
        record_id=record_id,
        features=None,
        metadata={
            "record_id": record_id,
            "survey_number": doc.get("survey_number"),
            "owner_name": doc.get("owner_name"),
            "property_location": doc.get("property_location"),
            "district": doc.get("district"),
            "state": doc.get("state"),
            "area": doc.get("area"),
            "unit": doc.get("unit"),
            "accessed_by": user["email"],
            "user_name": user.get("full_name"),
            "user_role": user.get("role"),
            "phone_number": settings.SECURITY_ALERT_PHONE_NUMBER,
            "formatted_datetime": formatted_dt,
            "action": "view_details",
        }
    )

    phone_alert = alert.get("phone_alert") if alert else None
    return _to_out(doc, access_alert=phone_alert)


@router.put("/{record_id}", response_model=LandRecordOut)
async def update(record_id: str, payload: LandRecordUpdate, user=Depends(current_user)):
    require_roles(user, ["land_officer", "admin"])
    rec = await get_record(record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    old_owner_phone = rec.get("owner_phone")
    new_owner_phone = updates.get("owner_phone")
    doc = await update_record(record_id, updates, user["email"])
    if new_owner_phone and new_owner_phone != old_owner_phone:
        from ..services.activity_service import log_event
        await log_event(
            "phone_number_altered",
            user["email"],
            record_id,
            None,
            {"old_phone": old_owner_phone, "new_phone": new_owner_phone, "target": "land_record_owner"}
        )
    return _to_out(doc)


@router.get("/{record_id}/history")
async def history(record_id: str, user=Depends(current_user)):
    rec = await get_record(record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    items = await get_history(record_id)
    for it in items:
        it["id"] = str(it.pop("_id"))
    return {"record_id": record_id, "items": items}


@router.get("/{record_id}/verify")
async def verify(record_id: str, user=Depends(current_user)):
    res = await verify_integrity(record_id)
    if res is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return res


def _to_out(doc, access_alert: dict | None = None) -> LandRecordOut:
    return LandRecordOut(
        id=str(doc["_id"]),
        survey_number=doc["survey_number"],
        property_location=doc["property_location"],
        district=doc["district"],
        state=doc["state"],
        area=doc["area"],
        unit=doc["unit"],
        owner_name=doc["owner_name"],
        owner_phone=doc.get("owner_phone"),
        registration_date=doc["registration_date"],
        status=doc["status"],
        version=doc.get("version", 1),
        current_hash=doc.get("current_hash"),
        blockchain_tx_ref=doc.get("blockchain_tx_ref"),
        blockchain_status=doc.get("blockchain_status", "not_submitted"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
        last_modified_by=doc.get("last_modified_by"),
        last_sms_alert=access_alert or doc.get("last_sms_alert"),
    )
