const API_BASE = "http://localhost:8000/api";

export type User = {
    id: number;
    email: string;
    name: string;
    experienceLevel?: string;
    profile_image_url?: string | null;
};

export type SignupPayload = {
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
};

export async function loginApi(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.detail || "Invalid email or password");
    }

    if (typeof data?.id !== "number" || !data?.email || !data?.name) {
        throw new Error("Login response missing { id, email, name }");
    }

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        experienceLevel: data.experienceLevel,
        profile_image_url: data.profile_image_url ?? null,
    };
}

export async function signUpApi(payload: SignupPayload): Promise<User> {
    // ✅ matches your backend: /api/auth/signup
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.detail || "Signup failed");
    }

    // Your backend returns dict row {id,email,name} because of RealDictCursor
    if (typeof data?.id !== "number" || !data?.email || !data?.name) {
        throw new Error("Signup response missing { id, email, name }");
    }

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        profile_image_url: data.profile_image_url ?? null,
    };
}

export async function emailExistsApi(email: string): Promise<boolean> {
    const url = new URL(`${API_BASE}/auth/email-exists`);
    url.searchParams.set("email", email.trim().toLowerCase());

    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.detail || "Email check failed");
    }

    return !!data?.exists;
}

export async function forgotPasswordApi(email: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
        throw new Error("Failed to send reset request.");
    }
}

export async function resetPasswordApi(
    token: string,
    newPassword: string,
    confirmPassword: string
) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token,
            new_password: newPassword,
            confirm_password: confirmPassword,
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.detail || "Reset failed.");
    }

    return data as { detail: string };
}
