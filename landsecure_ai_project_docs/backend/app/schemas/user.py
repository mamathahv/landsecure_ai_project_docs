import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional


def _clean_phone(v):
    if v is None:
        return None
    v = str(v).strip()
    if not v:
        return None
    digits = re.sub(r"\D", "", v)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    return digits


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=100)
    role: str = "citizen"
    phone_number: Optional[str] = Field(None, pattern=r'^\d{10}$')

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, v):
        return v.strip().lower() if isinstance(v, str) else v

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_name(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("role", mode="before")
    @classmethod
    def clean_role(cls, v):
        r = str(v or "citizen").strip().lower()
        if r not in ("citizen", "land_officer", "admin"):
            raise ValueError("Role must be citizen, land_officer, or admin")
        return r

    @field_validator("phone_number", mode="before")
    @classmethod
    def clean_phone(cls, v):
        return _clean_phone(v)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, v):
        return v.strip().lower() if isinstance(v, str) else v


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    phone_number: Optional[str] = None


class UserProfileUpdate(BaseModel):
    phone_number: Optional[str] = Field(None, pattern=r'^\d{10}$')
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)

    @field_validator("phone_number", mode="before")
    @classmethod
    def clean_phone(cls, v):
        return _clean_phone(v)

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_name(cls, v):
        return v.strip() if isinstance(v, str) else v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
