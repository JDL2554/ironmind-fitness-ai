import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.db import init_db
from .services.exercise_store import load_exercise_data
from fastapi.staticfiles import StaticFiles

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

from .routes.exercises import router as exercises_router
from .routes.auth import router as auth_router
from .modules.login import router as login_router
#from app.modules.signup import router as signup_router
from appDir.routes.profile import router as profile_router
from appDir.routes.password_reset import router as password_reset_router





app = FastAPI(title="IronMind API")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    load_exercise_data()

app.include_router(exercises_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(login_router, prefix="/api")
#app.include_router(signup_router, prefix="/api")
app.include_router(profile_router)
app.include_router(password_reset_router)

@app.get("/api/health")
def health():
    return {"status": "ok"}