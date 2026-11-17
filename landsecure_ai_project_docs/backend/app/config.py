import os
from pydantic_settings import BaseSettings

_env_file = os.path.join(os.path.dirname(__file__), "..", ".env")


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://127.0.0.1:27017"
    MONGODB_DB: str = "landsecure"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    BLOCKCHAIN_RPC_URL: str = "http://127.0.0.1:8545"
    CONTRACT_ADDRESS: str = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    BLOCKCHAIN_PRIVATE_KEY: str = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    SECURITY_ALERT_PHONE_NUMBER: str = "7795159602"

    class Config:
        env_file = (_env_file, ".env")
        extra = "ignore"


settings = Settings()
