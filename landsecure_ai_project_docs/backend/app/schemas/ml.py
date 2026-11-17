from pydantic import BaseModel, Field
from typing import Optional


class PredictRequest(BaseModel):
    failed_login_count: int = 0
    requests_per_minute: float = 0
    access_outside_normal_hours: int = 0
    permission_mismatch: int = 0
    records_modified_short_period: int = 0
    repeated_requests_same_source: int = 0
    hash_mismatch: int = 0
    auth_result: int = 1
    model: Optional[str] = "random_forest"


class PredictResponse(BaseModel):
    predicted_class: str
    score: float
    severity: str
    model: str
    explanation: str
