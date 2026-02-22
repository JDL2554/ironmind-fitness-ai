const API_BASE = "http://localhost:8000/api";



export type SendFriendRequestPayload = {
    friend_code?: string | null;
    name?: string | null;
}

export type PendingRequest = {
    id: number;
    name: string;
    friend_code: string;
};

export type FriendListItem = {
    id: number;
    name: string;
    friend_code: string;
    profile_image_url?: string | null;
};

export async function getIncomingFriendRequests(userId: number) {
    const res = await fetch(`${API_BASE}/friends/requests/${userId}`, {
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Failed to load requests.");
    return data as PendingRequest[];
}

export async function acceptFriendRequest(userId: number, otherId: number) {
    const res = await fetch(`${API_BASE}/friends/accept/${userId}/${otherId}`, {
        method: "PATCH",
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Failed to accept request.");
    return data as { ok: boolean };
}

export async function declineFriendRequest(userId: number, otherId: number) {
    const res = await fetch(`${API_BASE}/friends/decline/${userId}/${otherId}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Failed to decline request.");
    return data as { ok: boolean };
}

export async function sendFriendRequestByCode(
    userId: number,
    payload: SendFriendRequestPayload
) {
    const raw = (payload.friend_code || "").trim();
    const cleaned = raw.startsWith("#") ? raw.slice(1) : raw;

    if (!cleaned) {
        throw new Error("Friend code is required.");
    }

    const res = await fetch(`${API_BASE}/friends/request/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friend_code: cleaned }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Failed to send friend request.");
    return data as { ok: boolean; message?: string; target_name?: string };
}

export async function getFriendsList(userId: number) {
    const res = await fetch(`${API_BASE}/friends/list/${userId}`, {
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Failed to load friends.");
    return data as FriendListItem[];
}

export async function removeFriend(userId: number, otherId: number) {
    const res = await fetch(`${API_BASE}/friends/remove/${userId}/${otherId}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Failed to remove friend.");
    return data as { ok: boolean };
}