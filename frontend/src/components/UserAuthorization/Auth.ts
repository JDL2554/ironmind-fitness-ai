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
    const res = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Signup failed");
    }

    return res.json();
}