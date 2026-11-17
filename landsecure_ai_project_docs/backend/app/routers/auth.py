from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from ..schemas.user import UserCreate, LoginRequest, UserOut, Token
from ..services.user_service import create_user, get_user_by_email
from ..security import verify_password, create_access_token, decode_token
from ..database import db

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/register", response_model=Token, status_code=201)
async def register(payload: UserCreate):
    user = await create_user(payload.email, payload.password, payload.full_name, payload.role, payload.phone_number)
    if user is None:
        raise HTTPException(status_code=409, detail="Email already registered")
    access_token = create_access_token(str(user["_id"]))
    return Token(
        access_token=access_token,
        user=UserOut(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            phone_number=user.get("phone_number"),
        ),
    )


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest):
    user = await get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("password_hash")):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(str(user["_id"]))
    return Token(
        access_token=access_token,
        user=UserOut(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            phone_number=user.get("phone_number"),
        ),
    )


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    user_id = decode_token(token)
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "phone_number": user.get("phone_number"),
    }
