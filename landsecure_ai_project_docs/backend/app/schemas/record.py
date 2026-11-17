from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LandRecordCreate(BaseModel):
    survey_number: str = Field(min_length=1, max_length=50)
    property_location: str = Field(min_length=1, max_length=200)
    district: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    area: float = Field(gt=0)
    unit: str = "sqft"
    owner_name: str = Field(min_length=1, max_length=100)
    owner_phone: Optional[str] = Field(None, pattern=r'^\d{10}$')
    registration_date: str
    status: str = "active"


class LandRecordUpdate(BaseModel):
    property_location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    area: Optional[float] = None
    unit: Optional[str] = None
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = Field(None, pattern=r'^\d{10}$')
    status: Optional[str] = None


class LandRecordOut(BaseModel):
    id: str
    survey_number: str
    property_location: str
    district: str
    state: str
    area: float
    unit: str
    owner_name: str
    owner_phone: Optional[str] = None
    registration_date: str
    status: str
    version: int
    current_hash: Optional[str] = None
    blockchain_tx_ref: Optional[str] = None
    blockchain_status: str = "not_submitted"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_modified_by: Optional[str] = None
    last_sms_alert: Optional[dict] = None
