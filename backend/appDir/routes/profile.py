import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from appDir.core.db import get_conn
from pydantic import BaseModel, EmailStr
from psycopg2 import errors

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