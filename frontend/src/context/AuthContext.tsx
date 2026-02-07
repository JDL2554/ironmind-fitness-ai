import React, { createContext, useContext, useEffect, useState } from "react";

export type User = {
    id: number;
    email: string;
    name: string;
    photo_url?: string | null;
};

type AuthContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const refreshMe = async () => {
        // Adjust to your backend auth (cookies/JWT)
        // If cookies: add credentials: "include"
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) {
            setUser(null);
            return;
        }
        const data: User = await res.json();
        setUser(data);
    };

    useEffect(() => {
        refreshMe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, refreshMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
