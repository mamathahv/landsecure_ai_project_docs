from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import ping_db, db
from .routers.auth import router as auth_router
from .routers.records import router as records_router
from .routers.ml import router as ml_router
from .routers.blockchain import router as blockchain_router
from .routers.activity import router as activity_router
from .routers.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database indexes
    try:
        await db["users"].create_index("email", unique=True)
    except Exception:
        pass
    yield


app = FastAPI(title="LandSecure AI", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(records_router)
app.include_router(ml_router)
app.include_router(blockchain_router)
app.include_router(activity_router)
app.include_router(users_router)


@app.get("/health")
async def health():
    db_ok = await ping_db()
    return {"status": "ok", "database": db_ok}
