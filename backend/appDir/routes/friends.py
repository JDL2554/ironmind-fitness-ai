from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from appDir.core.db import get_conn
from appDir.routes.auth import get_profile

router = APIRouter(prefix="/api/friends", tags=["friends"])

class FriendCodeRequest(BaseModel):
    friend_code: str | None = None
    name: str | None = None

@router.post("/request/{user_id}")
def send_friend_request(user_id: int, payload: FriendCodeRequest):

    code = (payload.friend_code or "").strip()
    if code.startswith("#"):
        code = code[1:]

    if not code:
        raise HTTPException(status_code=400, detail="Invalid friend code.")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # Find target user
        cur.execute("SELECT id FROM users WHERE friend_code = %s", (code,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="No user found with that friend code.")

        target_id = row[0] if not isinstance(row, dict) else row["id"]

        if target_id == user_id:
            raise HTTPException(status_code=400, detail="You cannot add yourself.")

        low = min(user_id, target_id)
        high = max(user_id, target_id)

        # Check if relationship already exists
        cur.execute(
            "SELECT status FROM user_relationships WHERE user_low=%s AND user_high=%s",
            (low, high),
        )
        existing = cur.fetchone()

        if existing:
            status = existing[0] if not isinstance(existing, dict) else existing["status"]

            if status == "accepted":
                raise HTTPException(status_code=409, detail="You are already friends.")
            if status == "pending":
                raise HTTPException(status_code=409, detail="A friend request already exists.")
            if status == "blocked":
                raise HTTPException(status_code=403, detail="Cannot send request.")

        # Insert pending request
        cur.execute(
            """
            INSERT INTO user_relationships (user_low, user_high, initiated_by, status)
            VALUES (%s, %s, %s, 'pending')
            """,
            (low, high, user_id),
        )

        conn.commit()

        return {"ok": True, "message": "Friend request sent."}

    finally:
        cur.close()
        conn.close()

@router.get("/requests/{user_id}")
def list_incoming_requests(user_id: int):
    me = int(user_id)

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT
                u.id,
                u.name,
                u.friend_code
            FROM user_relationships r
            JOIN users u
              ON (
                    (r.user_low = %s AND r.user_high = u.id)
                 OR (r.user_high = %s AND r.user_low = u.id)
                 )
            WHERE r.status = 'pending'
              AND (r.user_low = %s OR r.user_high = %s)
              AND r.initiated_by <> %s
            ORDER BY u.name
            """,
            (me, me, me, me, me),
        )
        rows = cur.fetchall()
        out = []
        for row in rows:
            if isinstance(row, dict):
                out.append({"id": row["id"], "name": row["name"], "friend_code": row["friend_code"]})
            else:
                out.append({"id": row[0], "name": row[1], "friend_code": row[2]})
        return out
    finally:
        cur.close()
        conn.close()


@router.patch("/accept/{user_id}/{other_id}")
def accept_request(user_id: int, other_id: int):
    me = int(user_id)
    other = int(other_id)

    if me == other:
        raise HTTPException(status_code=400, detail="Invalid user.")

    low = min(me, other)
    high = max(me, other)

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE user_relationships
            SET status = 'accepted'
            WHERE user_low=%s AND user_high=%s
              AND status='pending'
              AND initiated_by <> %s
            """,
            (low, high, me),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Request not found.")
        conn.commit()
        return {"ok": True}
    finally:
        cur.close()
        conn.close()

@router.delete("/decline/{user_id}/{other_id}")
def decline_request(user_id: int, other_id: int):
    me = int(user_id)
    other = int(other_id)

    if me == other:
        raise HTTPException(status_code=400, detail="Invalid user.")

    low = min(me, other)
    high = max(me, other)

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            DELETE FROM user_relationships
            WHERE user_low=%s AND user_high=%s
              AND status='pending'
              AND initiated_by <> %s
            """,
            (low, high, me),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Request not found.")
        conn.commit()
        return {"ok": True}
    finally:
        cur.close()
        conn.close()

@router.get("/list/{user_id}")
def list_friends(user_id: int):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT
                u.id,
                u.name,
                u.friend_code,
                u.profile_image_url
            FROM user_relationships r
            JOIN users u
              ON (
                    (r.user_low = %s AND r.user_high = u.id)
                 OR (r.user_high = %s AND r.user_low = u.id)
                 )
            WHERE r.status = 'accepted'
              AND (r.user_low = %s OR r.user_high = %s)
            ORDER BY u.name
            """,
            (user_id, user_id, user_id, user_id),
        )

        rows = cur.fetchall()
        out = []
        for row in rows:
            if isinstance(row, dict):
                out.append(
                    {
                        "id": row["id"],
                        "name": row["name"],
                        "friend_code": row["friend_code"],
                        "profile_image_url": row.get("profile_image_url"),
                    }
                )
            else:
                out.append(
                    {
                        "id": row[0],
                        "name": row[1],
                        "friend_code": row[2],
                        "profile_image_url": row[3],
                    }
                )
        return out
    finally:
        cur.close()
        conn.close()

@router.delete("/remove/{user_id}/{other_id}")
def remove_friend(user_id: int, other_id: int):
    me = int(user_id)
    other = int(other_id)

    if me == other:
        raise HTTPException(status_code=400, detail="Invalid user.")

    low = min(me, other)
    high = max(me, other)

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            DELETE FROM user_relationships
            WHERE user_low = %s
              AND user_high = %s
              AND status = 'accepted'
            """,
            (low, high),
        )

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Friendship not found.")

        conn.commit()
        return {"ok": True}
    finally:
        cur.close()
        conn.close()