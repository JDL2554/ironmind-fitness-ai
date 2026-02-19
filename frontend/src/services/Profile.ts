const API_BASE = "http://localhost:8000/api";

export type ProfilePatch = Partial<{
    email: string;
    name: string;
    currentPassword: string;
}>;

export type StatsUpdatePayload = {
    age?: number;
    height?: string;
    weight?: number;
    experienceLevel?: string;
    workoutVolume?: string;
    equipment?: string;
    goals?: string[];

    session_length_minutes?: number;
};

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
    const res = await fetch(`${API_BASE}/${userId}`, {
        credentials: "include",
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to load profile");
    }

    return res.json() as Promise<{
        id: number;
        email: string;
        name: string;
        profile_image_url?: string | null;

        age?: number;
        height?: string;
        weight?: number;

        experienceLevel?: string;
        workoutVolume?: string;
        goals?: string[];
        equipment?: string;

        created_at?: string | null;
        session_time_minutes?: number;
    }>;
}

export async function updateProfile(userId: number, patch: ProfilePatch) {
    const res = await fetch(`http://localhost:8000/api/profile/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
    });

    if (!res.ok) {
        let msg = "Update failed.";
        try {
            const data = await res.json();
            msg = data?.detail || msg;
        } catch {}
        throw new Error(msg);
    }

    return res.json();
}

export async function changePassword(userId: number, oldPassword: string, newPassword: string, confirmPassword: string) {
    const res = await fetch(`${API_BASE}/profile/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Password update failed");
    return data as { message: string };
}

export async function updateUserStats(
    userId: number,
    payload: StatsUpdatePayload
) {
    const res = await fetch(`${API_BASE}/profile/user_stats/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to update profile");
    }

    return res.json();
}

export async function deleteAccount(userId: number) {
    const res = await fetch(`${API_BASE}/profile/delete/${userId}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || "Delete failed.");
    return data as { ok: true };
}