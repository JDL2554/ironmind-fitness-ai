from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from appDir.core.db import get_conn

router = APIRouter(prefix="/api/settings", tags=["settings"])

class ThemeUpdate(BaseModel):
    theme: str


@router.patch("/theme/{user_id}")
def update_theme(user_id: int, payload: ThemeUpdate):
    theme = (payload.theme or "").strip().lower()

    if theme not in ("light", "dark"):
        raise HTTPException(status_code=400, detail="Theme must be 'light' or 'dark'.")

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute(
            "UPDATE users SET theme = %s WHERE id = %s",
            (theme, user_id),
        )

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        conn.commit()
        return {"ok": True, "theme": theme}

    finally:
        cur.close()
        conn.close()