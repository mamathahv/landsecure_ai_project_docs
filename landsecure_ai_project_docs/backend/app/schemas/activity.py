from pydantic import BaseModel
from typing import Optional, Dict, Any


class ActivityLogRequest(BaseModel):
    event_type: str
    user_email: Optional[str] = None
    record_id: Optional[str] = None
    features: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class AlertUpdate(BaseModel):
    status: str  # open, investigated, resolved
