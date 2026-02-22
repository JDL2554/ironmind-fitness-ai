import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AppLayout.css";

type User = {
    id: number;
    email: string;
    name: string;
    experienceLevel?: string;
    profile_image_url?: string | null;
};

type Props = {
    user: User;
    onLogout: () => void;
};

export default function AppLayout({ user, onLogout }: Props) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    // close menu when clicking outside
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!menuRef.current) return;
            if (menuRef.current.contains(e.target as Node)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // initials (fallback)
    const initials = (user.name || user.email || "U")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    const avatarUrl = user.profile_image_url
        ? user.profile_image_url.startsWith("http")
            ? user.profile_image_url
            : `http://localhost:8000${user.profile_image_url}`
        : null;

    return (
        <div className="app-shell">
            <header className="topbar">
                <div
                    className="brand"
                    onClick={() => navigate("/dashboard")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") navigate("/dashboard");
                    }}
                >
                    <img
                        className="brand-logo"
                        src="/IronMindLogoWithoutText.png"
                        alt="IronMind"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                    />
                    <div className="brand-title">IronMind</div>
                </div>

                <nav className="nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/workout"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Workout
                    </NavLink>

                    <NavLink
                        to="/progress"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Progress
                    </NavLink>
                </nav>

                {/* Account bubble */}
                <div className="account" ref={menuRef}>
                    <button
                        className="account-btn"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Account menu"
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                                onError={(e) => {
                                    // if image fails to load, hide it so initials are shown next render
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="avatar">{initials || "U"}</div>
                        )}

                        <div className="account-meta">
                            <div className="account-name">{user.name}</div>
                            <div className="account-sub">{user.email}</div>
                        </div>
                        <div className={`chev ${open ? "up" : ""}`}>▾</div>
                    </button>

                    {open && (
                        <div className="menu">
                            <button
                                className="menu-item"
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/profile");
                                }}
                            >
                                Profile
                            </button>

                            <button
                                className="menu-item"
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/settings");
                                }}
                            >
                                Settings
                            </button>

                            <div className="menu-sep" />

                            <button
                                className="menu-item danger"
                                onClick={() => {
                                    setOpen(false);
                                    onLogout();
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}
