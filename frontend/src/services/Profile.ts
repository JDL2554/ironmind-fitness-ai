import {User} from "./api";

const API_BASE = "http://localhost:8000/api";

export async function uploadProfilePhoto(userId: number, file: File) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/profile/photo?user_id=${userId}`, {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Upload failed");
    }

    return res.json() as Promise<{ profile_image_url: string }>;
}

export async function getProfile(userId: number) {
    const res = await fetch(`${API_BASE}/profile/${userId}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to load profile");
    }
    return res.json() as Promise<{
        id: number;
        email: string;
        name: string;
        profile_image_url?: string | null;
    }>;
}

export async function updateProfile(userId: number, patch: Partial<Pick<User, "email" | "name">>) {
    const res = await fetch(`${API_BASE}/profile/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Update failed");

    return data as User; // expects {id,email,name,profile_image_url}
}