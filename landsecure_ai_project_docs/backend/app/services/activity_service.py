import os
from datetime import datetime, timezone
from bson import ObjectId
from ..database import db
from ..ml.predictor import predict
from ..config import settings
from .sms_service import send_sms_alert, format_phone_number

EVENTS = db["activity_events"]
ALERTS = db["alerts"]

DEFAULT_FEATURES = {
    "login_success": {"failed_login_count": 0, "requests_per_minute": 3, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 0, "repeated_requests_same_source": 1, "hash_mismatch": 0, "auth_result": 1},
    "login_failed": {"failed_login_count": 5, "requests_per_minute": 2, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 0, "repeated_requests_same_source": 3, "hash_mismatch": 0, "auth_result": 0},
    "record_view": {"failed_login_count": 0, "requests_per_minute": 4, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 0, "repeated_requests_same_source": 1, "hash_mismatch": 0, "auth_result": 1},
    "record_access": {"failed_login_count": 0, "requests_per_minute": 3, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 0, "repeated_requests_same_source": 1, "hash_mismatch": 0, "auth_result": 1},
    "record_access_failed": {"failed_login_count": 1, "requests_per_minute": 6, "access_outside_normal_hours": 0, "permission_mismatch": 1, "records_modified_short_period": 0, "repeated_requests_same_source": 2, "hash_mismatch": 0, "auth_result": 0},
    "record_create": {"failed_login_count": 0, "requests_per_minute": 2, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 1, "repeated_requests_same_source": 1, "hash_mismatch": 0, "auth_result": 1},
    "record_update": {"failed_login_count": 0, "requests_per_minute": 3, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 2, "repeated_requests_same_source": 1, "hash_mismatch": 0, "auth_result": 1},
    "unauthorized_attempt": {"failed_login_count": 2, "requests_per_minute": 10, "access_outside_normal_hours": 1, "permission_mismatch": 1, "records_modified_short_period": 0, "repeated_requests_same_source": 5, "hash_mismatch": 0, "auth_result": 0},
    "hash_mismatch": {"failed_login_count": 0, "requests_per_minute": 2, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 0, "repeated_requests_same_source": 1, "hash_mismatch": 1, "auth_result": 1},
    "phone_number_altered": {"failed_login_count": 0, "requests_per_minute": 2, "access_outside_normal_hours": 0, "permission_mismatch": 0, "records_modified_short_period": 1, "repeated_requests_same_source": 1, "hash_mismatch": 0, "auth_result": 1},
}


async def log_event(event_type: str, user_email: str | None, record_id: str | None, features: dict | None, metadata: dict | None):
    now = datetime.now(timezone.utc).isoformat()
    f = features if features else DEFAULT_FEATURES.get(event_type, DEFAULT_FEATURES["record_view"]).copy()
    prediction = predict(f)

    if event_type == "phone_number_altered":
        prediction["severity"] = "HIGH"
        prediction["predicted_class"] = "suspicious"
        prediction["explanation"] = f"Sensitive profile alteration: phone number changed to {metadata.get('new_phone') if metadata else 'unknown'}."
    elif event_type in ("record_access", "record_view"):
        # Land record access event - trigger SMS alert with access details, date, and time
        prediction["severity"] = "HIGH"
        prediction["predicted_class"] = "suspicious" if prediction.get("score", 0) > 0.5 else "normal"
        prediction["explanation"] = f"Land record access inspected: Survey #{metadata.get('survey_number', 'N/A') if metadata else 'N/A'} accessed by {user_email or 'system'}."
    elif event_type == "record_access_failed":
        prediction["severity"] = "CRITICAL"
        prediction["predicted_class"] = "suspicious"
        prediction["explanation"] = f"Attempted access to restricted or non-existent land record ID {record_id} by {user_email or 'anonymous'}."

    doc = {
        "event_type": event_type,
        "user_email": user_email,
        "record_id": record_id,
        "features": f,
        "prediction": prediction,
        "metadata": metadata or {},
        "created_at": now,
    }
    result = await EVENTS.insert_one(doc)
    doc["_id"] = result.inserted_id

    alert = None
    should_alert = (
        prediction["predicted_class"] == "suspicious"
        or prediction["severity"] in ("HIGH", "CRITICAL")
        or event_type in ("phone_number_altered", "record_access", "record_view", "record_access_failed")
    )

    if should_alert:
        # Determine target phone number - default to project security alert phone: 7795159602
        target_phone = settings.SECURITY_ALERT_PHONE_NUMBER or "7795159602"
        if event_type == "phone_number_altered" and metadata and metadata.get("new_phone"):
            target_phone = metadata.get("new_phone")
        elif metadata and metadata.get("phone_number"):
            target_phone = metadata.get("phone_number")
        elif user_email:
            user_doc = await db["users"].find_one({"email": user_email.lower()})
            if user_doc and user_doc.get("phone_number"):
                # Can notify user or security alert phone; project security alert phone is primary
                pass

        # Build access details, date, and time SMS message
        dt_str = (metadata.get("formatted_datetime") if metadata else None) or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        if event_type in ("record_access", "record_view"):
            survey = metadata.get("survey_number", "N/A") if metadata else "N/A"
            owner = metadata.get("owner_name", "N/A") if metadata else "N/A"
            loc = metadata.get("property_location", "") if metadata else ""
            dist = metadata.get("district", "") if metadata else ""
            accessor = user_email or (metadata.get("accessed_by") if metadata else None) or "system"
            role = metadata.get("user_role", "user") if metadata else "user"
            loc_str = f" in {loc}, {dist}" if loc or dist else ""

            sms_message = (
                f"LandSecure AI Alert: Land Record [Survey: {survey}, Owner: {owner}{loc_str}] "
                f"accessed by {accessor} ({role}) on {dt_str}. Action: Record Inspection."
            )
        elif event_type == "record_access_failed":
            accessor = user_email or "unauthorized_user"
            sms_message = (
                f"LandSecure AI Alert [SECURITY]: Attempted access to invalid/restricted Land Record ID {record_id} "
                f"by {accessor} on {dt_str}. Access Rejected."
            )
        elif event_type == "phone_number_altered":
            sms_message = (
                f"LandSecure AI Security Alert: Phone number altered for {user_email} to "
                f"{metadata.get('new_phone') if metadata else 'updated number'} on {dt_str}. If this wasn't you, report immediately."
            )
        else:
            sms_message = (
                f"LandSecure AI Alert [{prediction['severity']}]: {event_type} event triggered for account "
                f"{user_email or 'system'} on {dt_str}."
            )

        # Dispatch SMS via SMS Gateway
        phone_alert = send_sms_alert(target_phone, sms_message, metadata)

        alert_doc = {
            "event_id": str(result.inserted_id),
            "event_type": event_type,
            "severity": prediction["severity"],
            "status": "open",
            "prediction": prediction,
            "user_email": user_email,
            "record_id": record_id,
            "phone_alert": phone_alert,
            "created_at": now,
        }
        ares = await ALERTS.insert_one(alert_doc)
        alert_doc["_id"] = ares.inserted_id
        alert = alert_doc

    return doc, alert


async def list_events(skip: int = 0, limit: int = 50, event_type: str | None = None):
    query = {}
    if event_type:
        query["event_type"] = event_type
    cursor = EVENTS.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for d in cursor:
        d["id"] = str(d.pop("_id"))
        items.append(d)
    total = await EVENTS.count_documents(query)
    return items, total


async def list_alerts(skip: int = 0, limit: int = 50, status: str | None = None):
    query = {}
    if status:
        query["status"] = status
    cursor = ALERTS.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for d in cursor:
        d["id"] = str(d.pop("_id"))
        items.append(d)
    total = await ALERTS.count_documents(query)
    return items, total


async def update_alert(alert_id: str, status: str, user_email: str):
    try:
        oid = ObjectId(alert_id)
    except Exception:
        return None
    now = datetime.now(timezone.utc).isoformat()
    res = await ALERTS.update_one({"_id": oid}, {"$set": {"status": status, "resolved_by": user_email, "resolved_at": now}})
    if res.matched_count == 0:
        return None
    return await ALERTS.find_one({"_id": oid})


async def dashboard_stats():
    total_records = await db["land_records"].count_documents({})
    total_users = await db["users"].count_documents({})
    total_events = await EVENTS.count_documents({})
    suspicious_events = await EVENTS.count_documents({"prediction.predicted_class": "suspicious"})
    open_alerts = await ALERTS.count_documents({"status": "open"})
    critical = await ALERTS.count_documents({"severity": "CRITICAL"})
    high = await ALERTS.count_documents({"severity": "HIGH"})
    medium = await ALERTS.count_documents({"severity": "MEDIUM"})
    low = await ALERTS.count_documents({"severity": "LOW"})
    # recent events
    cursor = EVENTS.find().sort("created_at", -1).limit(10)
    recent = []
    async for d in cursor:
        d["id"] = str(d.pop("_id"))
        recent.append(d)
    return {
        "total_records": total_records,
        "total_users": total_users,
        "total_events": total_events,
        "suspicious_events": suspicious_events,
        "safe_events": total_events - suspicious_events,
        "open_alerts": open_alerts,
        "alerts_by_severity": {"CRITICAL": critical, "HIGH": high, "MEDIUM": medium, "LOW": low},
        "recent_events": recent,
    }
