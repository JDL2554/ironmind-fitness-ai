import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;

    // ✅ NEW: let the app hydrate theme from backend user profile
    hydrateTheme: (t?: string | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function normalizeTheme(t?: string | null): Theme | null {
    const v = (t || "").trim().toLowerCase();
    if (v === "light" || v === "dark") return v;
    return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // fallback for not-logged-in users
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme");
        const norm = normalizeTheme(saved);
        return norm ?? "dark";
    });

    const setTheme = (t: Theme) => setThemeState(t);

    const toggleTheme = () =>
        setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

    // ✅ backend hydration entry point
    const hydrateTheme = (t?: string | null) => {
        const norm = normalizeTheme(t);
        if (norm) setThemeState(norm);
    };

    useEffect(() => {
        // applies globally to the whole app
        document.documentElement.dataset.theme = theme;

        // optional fallback persistence
        localStorage.setItem("theme", theme);
    }, [theme]);

    const value = useMemo(
        () => ({ theme, setTheme, toggleTheme, hydrateTheme }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
}