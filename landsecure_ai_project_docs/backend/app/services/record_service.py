import hashlib
import json
from datetime import datetime, timezone
from bson import ObjectId
from ..database import db
from ..security import decode_token

RECORDS = db["land_records"]
VERSIONS = db["record_versions"]


def canonical_hash(record: dict) -> str:
    payload = {
        "survey_number": record.get("survey_number"),
        "property_location": record.get("property_location"),
        "district": record.get("district"),
        "state": record.get("state"),
        "area": record.get("area"),
        "unit": record.get("unit"),
        "owner_name": record.get("owner_name"),
        "registration_date": record.get("registration_date"),
        "status": record.get("status"),
        "version": record.get("version"),
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


async def create_record(data: dict, user_id: str, user_email: str):
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        **data,
        "version": 1,
        "blockchain_status": "not_submitted",
        "blockchain_tx_ref": None,
        "created_at": now,
        "updated_at": now,
        "last_modified_by": user_email,
    }
    doc["current_hash"] = canonical_hash(doc)
    result = await RECORDS.insert_one(doc)
    doc["_id"] = result.inserted_id
    await VERSIONS.insert_one({
        "record_id": str(result.inserted_id),
        "version": 1,
        "snapshot": {k: v for k, v in doc.items() if k != "_id"},
        "changed_by": user_email,
        "changed_at": now,
        "change_type": "create",
    })
    return doc


async def get_record(record_id: str):
    try:
        return await RECORDS.find_one({"_id": ObjectId(record_id)})
    except Exception:
        return None


async def list_records(skip: int = 0, limit: int = 20, search: str | None = None, district: str | None = None):
    query = {}
    if search:
        query["$or"] = [
            {"survey_number": {"$regex": search, "$options": "i"}},
            {"owner_name": {"$regex": search, "$options": "i"}},
            {"property_location": {"$regex": search, "$options": "i"}},
        ]
    if district:
        query["district"] = {"$regex": district, "$options": "i"}
    cursor = RECORDS.find(query).skip(skip).limit(limit).sort("created_at", -1)
    items = []
    async for doc in cursor:
        items.append(doc)
    total = await RECORDS.count_documents(query)
    return items, total


async def update_record(record_id: str, updates: dict, user_email: str):
    rec = await get_record(record_id)
    if not rec:
        return None
    now = datetime.now(timezone.utc).isoformat()
    new_version = rec.get("version", 1) + 1
    merged = {**rec, **updates}
    merged["version"] = new_version
    merged["updated_at"] = now
    merged["last_modified_by"] = user_email
    merged["current_hash"] = canonical_hash(merged)
    # reset blockchain status on content change
    merged["blockchain_status"] = "pending"
    await RECORDS.update_one({"_id": ObjectId(record_id)}, {"$set": {
        "property_location": merged["property_location"],
        "district": merged["district"],
        "state": merged["state"],
        "area": merged["area"],
        "unit": merged["unit"],
        "owner_name": merged["owner_name"],
        "owner_phone": merged.get("owner_phone"),
        "status": merged["status"],
        "version": new_version,
        "updated_at": now,
        "last_modified_by": user_email,
        "current_hash": merged["current_hash"],
        "blockchain_status": "pending",
    }})
    await VERSIONS.insert_one({
        "record_id": record_id,
        "version": new_version,
        "snapshot": {k: v for k, v in merged.items() if k != "_id"},
        "changed_by": user_email,
        "changed_at": now,
        "change_type": "update",
        "updates": updates,
    })
    return await get_record(record_id)


async def get_history(record_id: str):
    cursor = VERSIONS.find({"record_id": record_id}).sort("version", 1)
    items = []
    async for doc in cursor:
        items.append(doc)
    return items


async def verify_integrity(record_id: str):
    rec = await get_record(record_id)
    if not rec:
        return None
    recomputed = canonical_hash(rec)
    on_chain = rec.get("current_hash")
    # In this prototype, "on-chain" hash is the last registered hash stored in record;
    # real verification compares against blockchain. Here we compare recomputed vs stored.
    match = recomputed == on_chain
    return {"record_id": record_id, "recomputed_hash": recomputed, "stored_hash": on_chain, "verified": match}
