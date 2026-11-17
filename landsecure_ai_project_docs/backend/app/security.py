import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from .config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str | None) -> bool:
    if not plain or not hashed:
        return False
    try:
        if isinstance(hashed, str):
            hashed_bytes = hashed.encode("utf-8")
        else:
            hashed_bytes = bytes(hashed)
        return bcrypt.checkpw(plain.encode("utf-8"), hashed_bytes)
    except Exception:
        return False


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"sub": str(subject), "iat": now, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> str | None:
    if not token or not isinstance(token, str):
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        sub = payload.get("sub")
        return str(sub) if sub is not None else None
    except Exception:
        return None
