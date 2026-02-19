from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
import bcrypt
import json
from psycopg2 import errors
import secrets
import string

from appDir.core.db import get_conn

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

FRIEND_CODE_LEN = 8
FRIEND_CODE_ALPHABET = string.ascii_uppercase + string.digits  # no lowercase, easier to share

def generate_friend_code(length: int = FRIEND_CODE_LEN) -> str:
    return "".join(secrets.choice(FRIEND_CODE_ALPHABET) for _ in range(length))

@router.get("/{user_id}")
def get_profile(user_id: int):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT
                id,
                email,
                name,
                profile_image_url,
                age,
                height,
                weight,
                experience_level,
                workout_volume,
                goals,
                equipment,
                created_at,
                friend_code
            FROM users
            WHERE id = %s
            """,
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        # row is dict (RealDictCursor)
        return {
            "id": row["id"],
            "email": row["email"],
            "name": row["name"],
            "profile_image_url": row.get("profile_image_url"),

            "age": row["age"],
            "height": row["height"],
            "weight": row["weight"],

            "experienceLevel": row["experience_level"],
            "workoutVolume": row["workout_volume"],
            "goals": row["goals"],
            "equipment": row["equipment"],

            "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
            "friend_code": row.get("friend_code"),
        }
    finally:
        cur.close()
        conn.close()

@router.post("/auth/signup")
def signup(payload: SignupRequest):
    pw_hash = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # try a few times in the extremely rare case of a collision
        for _ in range(10):
            friend_code = generate_friend_code()

            try:
                cur.execute("""
                    INSERT INTO users (
                        email, name, password_hash, age, height, weight,
                        experience_level, workout_volume, goals, equipment,
                        friend_code
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    RETURNING id, email, name, friend_code;
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
                    payload.equipment,
                    friend_code,
                ))

                row = cur.fetchone()
                conn.commit()
                return row

            except errors.UniqueViolation:
                # could be email or friend_code collision
                conn.rollback()

                # check if email already exists -> return 409 (your existing behavior)
                cur.execute("SELECT 1 FROM users WHERE email = %s", (payload.email.lower().strip(),))
                if cur.fetchone():
                    raise HTTPException(status_code=409, detail="Email already registered")

                # otherwise it was probably friend_code collision; loop and try again
                continue

        raise HTTPException(status_code=500, detail="Could not generate friend code, please try again.")

    finally:
        cur.close()
        conn.close()

@router.get("/auth/email-exists")
def email_exists(email: EmailStr):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM users WHERE email = %s", (email.lower().strip(),))
        return {"exists": cur.fetchone() is not None}
    finally:
        cur.close()
        conn.close()
