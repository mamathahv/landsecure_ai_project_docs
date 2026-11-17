from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from ..blockchain.service import register_hash, update_hash, verify_hash, is_connected
from ..services.record_service import get_record, canonical_hash
from ..routers.auth import get_current_user_id
from ..database import db
from ..schemas.blockchain import RegisterRequest, VerifyRequest

router = APIRouter(prefix="/blockchain", tags=["blockchain"])


@router.get("/status")
def status():
    return {"connected": is_connected()}


@router.post("/register")
async def register(payload: RegisterRequest, user_id: str = Depends(get_current_user_id)):
    rec = await get_record(payload.record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    record_id = payload.record_id
    h = rec.get("current_hash")
    version = rec.get("version", 1)
    bc_status = rec.get("blockchain_status", "not_submitted")
    try:
        if bc_status == "confirmed":
            # update
            txh, ok = update_hash(record_id, h, version)
        else:
            txh, ok = register_hash(record_id, h, version)
    except Exception as e:
        await db["land_records"].update_one({"_id": ObjectId(record_id)}, {"$set": {"blockchain_status": "failed"}})
        raise HTTPException(status_code=500, detail=str(e))
    new_status = "confirmed" if ok else "failed"
    await db["land_records"].update_one({"_id": ObjectId(record_id)}, {"$set": {
        "blockchain_tx_ref": txh,
        "blockchain_status": new_status,
    }})
    return {"record_id": record_id, "tx_hash": txh, "status": new_status}


@router.post("/verify")
async def verify(payload: VerifyRequest, user_id: str = Depends(get_current_user_id)):
    rec = await get_record(payload.record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    h = rec.get("current_hash")
    res = verify_hash(payload.record_id, h)
    # also recompute integrity
    from ..services.record_service import canonical_hash
    recomputed = canonical_hash(rec)
    integrity_ok = recomputed == rec.get("current_hash")
    return {"record_id": payload.record_id, "blockchain": res, "integrity_match": integrity_ok, "recomputed_hash": recomputed}
