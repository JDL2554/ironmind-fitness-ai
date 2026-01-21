from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import bcrypt

from app.core.db import get_conn

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    id: int
    email: EmailStr
    name: str

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, email, name, password_hash FROM users WHERE email = %s",
            (payload.email.lower().strip(),)
        )
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # ✅ Use dict-style access (works for DictRow/RealDictRow)
        user_id = row["id"]
        email = row["email"]
        name = row["name"]
        password_hash = row["password_hash"]

        # ✅ Normalize hash to bytes safely
        if isinstance(password_hash, memoryview):
            password_hash = password_hash.tobytes()
        if isinstance(password_hash, str):
            password_hash_bytes = password_hash.encode("utf-8")
        else:
            password_hash_bytes = bytes(password_hash)

        ok = bcrypt.checkpw(
            payload.password.encode("utf-8"),
            password_hash_bytes
        )
        if not ok:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return LoginResponse(id=user_id, email=email, name=name)

    finally:
        cur.close()
        conn.close()
