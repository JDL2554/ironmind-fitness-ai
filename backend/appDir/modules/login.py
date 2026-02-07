from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import bcrypt

from appDir.core.db import get_conn

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    profile_image_url: str | None = None

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, name, password_hash, profile_image_url FROM users WHERE email = %s",
        (payload.email.lower().strip(),)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = row["id"]
    email = row["email"]
    name = row["name"]
    password_hash = row["password_hash"]
    profile_image_url = row.get("profile_image_url")  # may be None

    stored = password_hash

    print("LOGIN password_hash repr:", repr(stored))
    print("LOGIN password_hash type:", type(stored))

    # normalize to bytes safely
    if isinstance(stored, str):
        stored_bytes = stored.encode("utf-8")
    else:
        stored_bytes = stored  # bytes/bytearray

    try:
        ok = bcrypt.checkpw(payload.password.encode("utf-8"), stored_bytes)
    except ValueError as e:
        print("BCRYPT ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "id": user_id,
        "email": email,
        "name": name,
        "profile_image_url": profile_image_url,
    }