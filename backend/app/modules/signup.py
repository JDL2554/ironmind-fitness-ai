# signup.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import json
import bcrypt
import psycopg2

from app.core.db import get_conn, init_db

app = FastAPI(title="IronMind API")

# Allow React dev server to call your API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignupRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=6, max_length=200)

    age: int = Field(ge=13, le=120)
    height: str  # keep as "5'9"" like your frontend
    weight: float = Field(ge=50, le=500)

    experienceLevel: str
    workoutVolume: str
    goals: list[str] = Field(min_length=1)
    equipment: str

class SignupResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    age: int
    height: str
    weight: float
    experienceLevel: str
    workoutVolume: str
    goals: list[str]
    equipment: str

@app.on_event("startup")
def on_startup():
    init_db()

@app.post("/signup", response_model=SignupResponse)
def signup(payload: SignupRequest):
    # Hash password (never store plaintext)
    pw_hash = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO users (
                email, name, password_hash, age, height, weight,
                experience_level, workout_volume, goals, equipment
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
            RETURNING id
        """, (
                payload.email.lower().strip(),
                payload.name.strip(),
                pw_hash,
                payload.age,
                payload.height,
                payload.weight,
                payload.experienceLevel,
                payload.workoutVolume,
                json.dumps(payload.goals),
                payload.equipment
            ))
        user_id = cur.fetchone()[0]
        conn.commit()

    except psycopg2.Error as e:
        conn.rollback()
        if e.pgcode == "23505":
            raise HTTPException(status_code=409, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Database error")

    finally:
        conn.close()

    return SignupResponse(
        id=user_id,
        email=payload.email,
        name=payload.name,
        age=payload.age,
        height=payload.height,
        weight=payload.weight,
        experienceLevel=payload.experienceLevel,
        workoutVolume=payload.workoutVolume,
        goals=payload.goals,
        equipment=payload.equipment,
    )
