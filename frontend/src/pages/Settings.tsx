import React, { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { updateTheme } from "../services/Settings";
import { User } from "../App";

type Theme = "light" | "dark";

export default function Settings({ user }: { user: User }) {
    const { theme, setTheme } = useTheme();
    const isLight = theme === "light";

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    const cardStyle: React.CSSProperties = {
        marginTop: 18,
        padding: 16,
        borderRadius: 16,
        border: isLight ? "1px solid rgba(17,24,39,0.12)" : "1px solid rgba(255,255,255,0.15)",
        background: isLight ? "rgba(255,255,255,0.92)" : "rgba(20,22,28,0.72)",
        boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.08)" : "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
    };

    const titleStyle: React.CSSProperties = {
        margin: 0,
        fontWeight: 900,
        fontSize: 22,
        color: isLight ? "#111827" : "white",
    };

    const subStyle: React.CSSProperties = {
        marginTop: 6,
        marginBottom: 0,
        opacity: isLight ? 0.75 : 0.8,
        color: isLight ? "#111827" : "white",
    };

    const rowStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 14,
        flexWrap: "wrap",
    };

    const pillBtn: React.CSSProperties = {
        padding: "10px 14px",
        borderRadius: 999,
        fontWeight: 800,
        cursor: saving ? "not-allowed" : "pointer",
        border: isLight ? "1px solid rgba(17,24,39,0.14)" : "1px solid rgba(255,255,255,0.18)",
        background: isLight ? "rgba(17,24,39,0.06)" : "rgba(255,255,255,0.06)",
        color: isLight ? "#111827" : "white",
        opacity: saving ? 0.7 : 1,
    };

    const activePill: React.CSSProperties = {
        border: isLight ? "1px solid rgba(37,99,235,0.35)" : "1px solid rgba(59,130,246,0.45)",
        background: isLight ? "rgba(37,99,235,0.12)" : "rgba(59,130,246,0.16)",
    };

    async function persistTheme(next: Theme) {
        if (saving) return;

        setErr("");
        setMsg("");

        const prev = theme;

        // optimistic UI
        setTheme(next);
        setSaving(true);

        try {
            await updateTheme(user.id, next);
            setMsg("Saved!");
            window.setTimeout(() => setMsg(""), 1200);
        } catch (e: any) {
            // rollback
            setTheme(prev);
            setErr(e?.message || "Failed to update theme.");
        } finally {
            setSaving(false);
        }
    }

    const onToggle = () => {
        const next: Theme = theme === "light" ? "dark" : "light";
        persistTheme(next);
    };

    return (
        <div style={{ padding: 24 }}>
            <h2 style={titleStyle}>⚙️ Settings</h2>
            <p style={subStyle}>Customize your preferences.</p>

            {/* Appearance */}
            <div style={cardStyle}>
                <div style={{ fontWeight: 900, fontSize: 16, color: isLight ? "#111827" : "white" }}>
                    Appearance
                </div>

                <div
                    style={{
                        marginTop: 6,
                        fontSize: 13,
                        opacity: isLight ? 0.75 : 0.8,
                        color: isLight ? "#111827" : "white",
                    }}
                >
                    Switch between light and dark mode. This is saved to your account.
                </div>

                <div style={rowStyle}>
                    <div style={{ fontWeight: 800, opacity: isLight ? 0.8 : 0.85, color: isLight ? "#111827" : "white" }}>
                        Current: {isLight ? "Light" : "Dark"}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={() => persistTheme("dark")}
                        style={{ ...pillBtn, ...(theme === "dark" ? activePill : {}) }}
                        disabled={saving}
                    >
                        🌙 Dark
                    </button>

                    <button
                        type="button"
                        onClick={() => persistTheme("light")}
                        style={{ ...pillBtn, ...(theme === "light" ? activePill : {}) }}
                        disabled={saving}
                    >
                        ☀️ Light
                    </button>

                    {msg && <div style={{ fontWeight: 900, color: "#4ade80", alignSelf: "center" }}>{msg}</div>}
                </div>

                {err && <div style={{ marginTop: 10, fontWeight: 900, color: "salmon" }}>{err}</div>}
            </div>

            {/* Future settings placeholder */}
            <div style={cardStyle}>
                <div style={{ fontWeight: 900, fontSize: 16, color: isLight ? "#111827" : "white" }}>
                    More settings
                </div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: isLight ? 0.75 : 0.8, color: isLight ? "#111827" : "white" }}>
                    Notifications, units, and other preferences can go here later.
                </div>
            </div>
        </div>
    );
}