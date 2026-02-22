import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from appDir.core.db import get_conn

router = APIRouter(prefix="/api/auth", tags=["auth"])

RESET_TTL_MINUTES = 30
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")  # change if needed


def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str
    confirm_password: str


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordIn):
    """
    Dev-mode: prints reset link to backend logs.
    Always returns 200 to avoid leaking whether an email exists.
    """
    email = payload.email.strip().lower()

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE lower(trim(email)) = %s", (email,))
    row = cur.fetchone()

    if row:
        user_id = row["id"]

        token = secrets.token_urlsafe(32)  # raw token shown to user (in logs)
        token_hash = sha256_hex(token)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TTL_MINUTES)

        cur.execute(
            """
            INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
            VALUES (%s, %s, %s)
            """,
            (user_id, token_hash, expires_at),
        )
        conn.commit()

        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        print("\n========== PASSWORD RESET (DEV MODE) ==========")
        print(f"Email: {email}")
        print(f"Reset link (valid {RESET_TTL_MINUTES} min): {reset_link}")
        print("==============================================\n")

    conn.close()

    # Always same response
    return {"detail": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordIn):
    token = (payload.token or "").strip()
    new_pw = payload.new_password
    conf_pw = payload.confirm_password

    if not token:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired. Please "
                                                    "request a new one.")
    if not new_pw or len(new_pw) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if new_pw != conf_pw:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    token_hash = sha256_hex(token)
    now = datetime.now(timezone.utc)

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, user_id, expires_at, used_at
        FROM password_reset_tokens
        WHERE token_hash = %s
          AND used_at IS NULL
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (token_hash,),
    )
    row = cur.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="This reset link is invalid or has "
                                                    "expired. Please request a new one.")

    token_id = row["id"]
    user_id = row["user_id"]
    expires_at = row["expires_at"]
    used_at = row["used_at"]

    # Ensure timezone-aware compare
    if used_at is not None:
        conn.close()
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired. "
                                                    "Please request a new one.")
    if expires_at is None or expires_at.replace(tzinfo=timezone.utc) < now:
        conn.close()
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired. "
                                                    "Please request a new one.")

    # Hash new password
    pw_hash = bcrypt.hashpw(new_pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Update password + mark token used
    cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (pw_hash, user_id))
    cur.execute("UPDATE password_reset_tokens SET used_at = %s WHERE id = %s", (now, token_id))
    conn.commit()
    conn.close()

    return {"detail": "Password updated successfully."}
