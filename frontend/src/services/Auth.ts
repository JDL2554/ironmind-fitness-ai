const API_BASE = "http://localhost:8000/api";

export async function signUpApi(payload: {
    email: string;
    name: string;
    password: string;
    age: number;
    height: string;
    weight: number;
    experienceLevel: string;
    workoutVolume: string;
    goals: string[];
    equipment: string;
}) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Signup failed");
    }

    return res.json();
}

export async function emailExistsApi(email: string): Promise<boolean> {
    const url = new URL(`${API_BASE}/auth/email-exists`);
    url.searchParams.set("email", email);

    const res = await fetch(url.toString(), { method: "GET" });

    if (!res.ok) {
        // if backend is down etc.
        throw new Error("Email check failed");
    }

    const data = await res.json().catch(() => ({}));
    return !!data?.exists;
}