const API_BASE: string = "http://localhost:8000/api";

export async function updateTheme(
    userId: number,
    theme: "light" | "dark"
) {
    const res = await fetch(
        `${API_BASE}/settings/theme/${userId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ theme }),
        }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.detail || "Failed to update theme");
    }

    return data as { ok: boolean; theme: "light" | "dark" };
}