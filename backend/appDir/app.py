from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.db import init_db
from .services.exercise_store import load_exercise_data

from .routes.exercises import router as exercises_router
from .routes.auth import router as auth_router
from .modules.login import router as login_router
#from app.modules.signup import router as signup_router

app = FastAPI(title="IronMind API")

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

@app.get("/api/health")
def health():
    return {"status": "ok"}