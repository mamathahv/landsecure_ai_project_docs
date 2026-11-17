from pydantic import BaseModel


class RegisterRequest(BaseModel):
    record_id: str


class VerifyRequest(BaseModel):
    record_id: str
