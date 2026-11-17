from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from ..schemas.activity import ActivityLogRequest, AlertUpdate
from ..services.activity_service import log_event, list_events, list_alerts, update_alert, dashboard_stats
from ..routers.auth import get_current_user_id
from ..database import db

router = APIRouter(tags=["activity"])


@router.post("/activity/log")
async def log(payload: ActivityLogRequest, user_id: str = Depends(get_current_user_id)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    email = payload.user_email or (user["email"] if user else None)
    doc, alert = await log_event(payload.event_type, email, payload.record_id, payload.features, payload.metadata)
    doc["id"] = str(doc.pop("_id"))
    if alert:
        alert["id"] = str(alert.pop("_id"))
    return {"event": doc, "alert": alert}


@router.get("/activity/events")
async def events(skip: int = 0, limit: int = Query(50, le=200), event_type: str | None = None, user_id: str = Depends(get_current_user_id)):
    items, total = await list_events(skip, limit, event_type)
    return {"items": items, "total": total}


@router.get("/alerts")
async def alerts(skip: int = 0, limit: int = Query(50, le=200), status: str | None = None, user_id: str = Depends(get_current_user_id)):
    items, total = await list_alerts(skip, limit, status)
    return {"items": items, "total": total}


@router.patch("/alerts/{alert_id}")
async def update_alert_endpoint(alert_id: str, payload: AlertUpdate, user_id: str = Depends(get_current_user_id)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    res = await update_alert(alert_id, payload.status, user["email"] if user else "unknown")
    if res is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    res["id"] = str(res.pop("_id"))
    return res


@router.get("/dashboard/stats")
async def stats(user_id: str = Depends(get_current_user_id)):
    return await dashboard_stats()
