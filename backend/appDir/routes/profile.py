import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from appDir.core.db import get_conn
from pydantic import BaseModel, EmailStr, Field
from psycopg2 import errors
import bcrypt
import json
from typing import Optional

router = APIRouter(prefix="/api/profile", tags=["profile"])

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_BYTES = 5 * 1024 * 1024  # 5MB

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProfileUpdate(BaseModel):
    email: EmailStr | None = None
    name: str | None = None

    currentPassword: Optional[str] = None

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

class UserStatsUpdate(BaseModel):
    age: int | None = Field(default=None, ge=13, le=120)
    height: str | None = None
    weight: float | None = Field(default=None, ge=50, le=500)

    experienceLevel: str | None = None
    workoutVolume: str | None = None
    goals: list[str] | None = None
    equipment: str | None = None

@router.post("/photo")
async def upload_profile_photo(user_id: int, file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WebP image.",
        )

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File too large (max 5MB).",
        )

    ext = ALLOWED_TYPES[file.content_type]
    filename = f"user_{user_id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(data)

    public_url = f"/uploads/{filename}"

    conn = get_conn()
    cur = conn.cursor()

    # ✅ fetch previous image (dict row)
    cur.execute(
        "SELECT profile_image_url FROM users WHERE id = %s",
        (user_id,),
    )
    old = cur.fetchone()
    old_url = old.get("profile_image_url") if old else None

    # ✅ update to new image
    cur.execute(
        "UPDATE users SET profile_image_url = %s WHERE id = %s",
        (public_url, user_id),
    )
    conn.commit()
    conn.close()

    # ✅ safely delete previous image
    if old_url and old_url.startswith("/uploads/"):
        old_name = old_url.replace("/uploads/", "", 1)
        old_path = os.path.join(UPLOAD_DIR, old_name)
        if os.path.isfile(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    return {"profile_image_url": public_url}

@router.patch("/{user_id}")
def update_profile(user_id: int, payload: ProfileUpdate):
    conn = get_conn()
    cur = conn.cursor()

    try:
        updates = []
        params = []

        # normalize + validate
        if payload.email is not None:
            if not payload.currentPassword:
                raise HTTPException(status_code=400, detail="Current password required to change email.")

            cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found.")

            password_hash = row[0] if not isinstance(row, dict) else row["password_hash"]

            if not bcrypt.checkpw(payload.currentPassword.encode("utf-8"), password_hash.encode("utf-8")):
                raise HTTPException(status_code=401, detail="Invalid password.")

            new_email = payload.email.strip().lower()
            cur.execute(
                "SELECT 1 FROM users WHERE lower(email) = %s AND id <> %s",
                (new_email, user_id),
            )
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already in use.")

            updates.append("email = %s")
            params.append(new_email)

        if payload.name is not None:
            new_name = payload.name.strip()
            if not new_name:
                raise HTTPException(status_code=400, detail="Name cannot be empty.")
            updates.append("name = %s")
            params.append(new_name)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided.")

        params.append(user_id)
        cur.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = %s", tuple(params))

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        conn.commit()

        # fetch updated row
        cur.execute(
            "SELECT id, email, name, profile_image_url FROM users WHERE id = %s",
            (user_id,),
        )
        row = cur.fetchone()

        # normalize tuple vs dict cursor
        if isinstance(row, dict):
            return row
        return {
            "id": row[0],
            "email": row[1],
            "name": row[2],
            "profile_image_url": row[3],
        }

    except errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Email already in use.")
    finally:
        conn.close()


@router.patch("/{user_id}/password")
def update_password(user_id: int, payload: PasswordUpdate):
    # basic validation
    old_pw = (payload.old_password or "").strip()
    new_pw = (payload.new_password or "").strip()
    conf_pw = (payload.confirm_password or "").strip()

    if not old_pw or not new_pw or not conf_pw:
        raise HTTPException(status_code=400, detail="Please fill in all password fields.")
    if new_pw != conf_pw:
        raise HTTPException(status_code=400, detail="New passwords do not match.")
    if len(new_pw) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")
    if new_pw == old_pw:
        raise HTTPException(status_code=400, detail="New password must be different from old password.")

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Fetch current hash
        cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="User not found.")

        # row can be dict (RealDictCursor) OR tuple (default cursor)
        stored_hash = row["password_hash"] if isinstance(row, dict) else row[0]
        if not stored_hash:
            raise HTTPException(status_code=400, detail="Account has no password set.")

        # Verify old password
        try:
            ok = bcrypt.checkpw(old_pw.encode("utf-8"), stored_hash.encode("utf-8"))
        except ValueError:
            # this happens when DB contains a non-bcrypt string
            raise HTTPException(status_code=500, detail="Server password data is invalid.")

        if not ok:
            raise HTTPException(status_code=401, detail="Old password is incorrect.")

        # Hash new password + update
        new_hash = bcrypt.hashpw(new_pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
        conn.commit()

        return {"ok": True}

    finally:
        conn.close()

@router.patch("/user_stats/{user_id}")
def update_user_stats(user_id: int, payload: UserStatsUpdate):
    conn = get_conn()
    cur = conn.cursor()

    try:
        updates = []
        params = []

        if payload.age is not None:
            updates.append("age = %s")
            params.append(payload.age)

        if payload.height is not None:
            h = payload.height.strip()
            if not h:
                raise HTTPException(status_code=400, detail="Height cannot be empty.")
            updates.append("height = %s")
            params.append(h)

        if payload.weight is not None:
            updates.append("weight = %s")
            params.append(payload.weight)

        if payload.experienceLevel is not None:
            updates.append("experience_level = %s")
            params.append(payload.experienceLevel.strip())

        if payload.workoutVolume is not None:
            updates.append("workout_volume = %s")
            params.append(payload.workoutVolume.strip())

        if payload.goals is not None:
            if len(payload.goals) == 0:
                raise HTTPException(status_code=400, detail="Goals cannot be empty.")
            updates.append("goals = %s::jsonb")
            params.append(json.dumps(payload.goals))

        if payload.equipment is not None:
            updates.append("equipment = %s")
            params.append(payload.equipment.strip())

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided.")

        params.append(user_id)
        cur.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE id = %s",
            tuple(params),
        )

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        conn.commit()

        # Return updated stats
        cur.execute(
            """
            SELECT
                id,
                age, height, weight,
                experience_level, workout_volume, goals, equipment,
                created_at
            FROM users
            WHERE id = %s
            """,
            (user_id,),
        )
        row = cur.fetchone()

        return {
            "id": row["id"],
            "age": row["age"],
            "height": row["height"],
            "weight": row["weight"],
            "experienceLevel": row["experience_level"],
            "workoutVolume": row["workout_volume"],
            "goals": row["goals"],
            "equipment": row["equipment"],
            "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        }

    finally:
        cur.close()
        conn.close()