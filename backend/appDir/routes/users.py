from fastapi import APIRouter, Depends, Query
from appDir.core.db import get_conn
from appDir.routes.auth import get_profile

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/search")
def search_users(
        q: str = Query(..., min_length=1, max_length=50),
        limit: int = Query(8, ge=1, le=20),
        current_user=Depends(get_profile),
):
    query = q.strip()
    if not query:
        return []

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT id, name, friend_code
            FROM users
            WHERE id <> %s
              AND name ILIKE %s
            ORDER BY name
            LIMIT %s
            """,
            (current_user["id"], f"%{query}%", limit),
        )
        rows = cur.fetchall()
        return [{"id": r[0], "name": r[1], "friend_code": r[2]} for r in rows]
    finally:
        cur.close()
        conn.close()