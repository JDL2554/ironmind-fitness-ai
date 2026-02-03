import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AppLayout.css";

type User = {
    email: string;
    name: string;
    experienceLevel?: string;
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

    // basic initials (fallback)
    const initials = user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
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
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/workout" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                        Workout
                    </NavLink>
                    <NavLink to="/progress" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                        Progress
                    </NavLink>
                </nav>

                <div className="account" ref={menuRef}>
                    <button className="account-btn" onClick={() => setOpen((v) => !v)} aria-label="Account menu">
                        <div className="avatar">{initials || "U"}</div>
                        <div className="account-meta">
                            <div className="account-name">{user.name}</div>
                            <div className="account-sub">{user.email}</div>
                        </div>
                        <div className={`chev ${open ? "up" : ""}`}>▾</div>
                    </button>

                    {open && (
                        <div className="menu">
                            <button className="menu-item" onClick={() => { setOpen(false); navigate("/profile"); }}>
                                Profile
                            </button>
                            <button className="menu-item" onClick={() => { setOpen(false); navigate("/settings"); }}>
                                Settings
                            </button>
                            <div className="menu-sep" />
                            <button className="menu-item danger" onClick={() => { setOpen(false); onLogout(); }}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="content">
                {/* Outlet renders the active route page */}
                <Outlet />
            </main>
        </div>
    );
}
