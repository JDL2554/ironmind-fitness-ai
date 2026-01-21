from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
import bcrypt
import json
import psycopg2

from app.core.db import get_conn

router = APIRouter()

class SignupRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=6, max_length=200)
    age: int = Field(ge=13, le=120)
    height: str
    weight: float = Field(ge=50, le=500)
    experienceLevel: str
    workoutVolume: str
    goals: list[str] = Field(min_length=1)
    equipment: str

@router.post("/signup")
def signup(payload: SignupRequest):
    pw_hash = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO users (
                email, name, password_hash, age, height, weight,
                experience_level, workout_volume, goals, equipment
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id, email, name;
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
        row = cur.fetchone()
        conn.commit()
        return row
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")
    finally:
        conn.close()
