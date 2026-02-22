import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import AuthContainer from "./components/UserAuthorization/AuthContainer";
import AppLayout from "./components/Layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Workout from "./pages/Workout";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import Friends from "./pages/Friends";

import { getProfile } from "./services/Profile";

import "./App.css";

export interface User {
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
    friend_code?: string;
    session_length_minutes?: number;
    theme?: string;
}

const loadingSteps = [
    "Initializing IronMind...",
    "Loading exercise database...",
    "Calibrating AI recommendations...",
    "Preparing reinforcement learning...",
    "Optimizing workout algorithms...",
    "Ready to forge your fitness!",
];

const SESSION_KEY_UID = "ironmind_uid";

function App() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Initializing IronMind...");
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    // We store ONLY the authenticated user id (not the full user object).
    const [authUserId, setAuthUserId] = useState<number | null>(null);

    // Full hydrated user object fetched from backend.
    const [user, setUser] = useState<User | null>(null);

    // -------------------------------------------------
    // Restore auth user id on refresh (NOT full user)
    // -------------------------------------------------
    useEffect(() => {
        const savedId = sessionStorage.getItem(SESSION_KEY_UID);
        if (!savedId) return;

        const n = Number(savedId);
        if (!Number.isFinite(n) || n <= 0) {
            sessionStorage.removeItem(SESSION_KEY_UID);
            return;
        }
        setAuthUserId(n);
    }, []);

    // -------------------------------------------------
    // Hydrate: fetch full user whenever authUserId exists
    // -------------------------------------------------
    useEffect(() => {
        if (!authUserId) {
            setUser(null);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const full = await getProfile(authUserId);
                if (!cancelled) setUser(full);
            } catch (e) {
                console.error("Failed to hydrate user:", e);
                // If we can't fetch the user, treat as logged out.
                if (!cancelled) {
                    sessionStorage.removeItem(SESSION_KEY_UID);
                    setAuthUserId(null);
                    setUser(null);
                    navigate("/login", { replace: true });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [authUserId, navigate]);

    // -------------------------------------------------
    // Loading screen simulation (UNCHANGED)
    // -------------------------------------------------
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + 2;
                const stepIndex = Math.floor(
                    (newProgress / 100) * (loadingSteps.length - 1)
                );

                if (stepIndex !== currentStep && stepIndex < loadingSteps.length) {
                    setCurrentStep(stepIndex);
                    setLoadingText(loadingSteps[stepIndex]);
                }

                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setLoading(false), 1000);
                    return 100;
                }

                return newProgress;
            });
        }, 80);

        return () => clearInterval(interval);
    }, [currentStep]);

    // -------------------------------------------------
    // Auth handlers
    // -------------------------------------------------
    const handleAuthenticated = (userData: User) => {
        // Save only user id, then hydrate full profile via getProfile()
        setAuthUserId(userData.id);
        sessionStorage.setItem(SESSION_KEY_UID, String(userData.id));
        navigate("/dashboard", { replace: true });
    };

    const handleLogout = () => {
        setUser(null);
        setAuthUserId(null);
        sessionStorage.removeItem(SESSION_KEY_UID);
        navigate("/login", { replace: true });
    };

    const handleUserUpdate = useCallback((nextUser: User) => {
        // Any page (Profile) can update the user and it will persist in memory.
        setUser(nextUser);
    }, []);

    // -------------------------------------------------
    // Loading screen (UNCHANGED)
    // -------------------------------------------------
    if (loading) {
        return (
            <div className="App">
                <div className="loading-container">
                    <div className="background-animation">
                        <div className="floating-icon icon-1">💪</div>
                        <div className="floating-icon icon-2">🏋️</div>
                        <div className="floating-icon icon-3">⚡</div>
                        <div className="floating-icon icon-4">🎯</div>
                        <div className="floating-icon icon-5">🧠</div>
                        <div className="floating-icon icon-6">🔥</div>
                    </div>

                    <div className="loading-content">
                        <div className="logo-section">
                            <div className="main-logo">
                                <img
                                    src="/IronMindLogo.png"
                                    alt="IronMind Logo"
                                    className="logo-image"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        const fallback = document.querySelector(".fallback-logo");
                                        if (fallback) {
                                            (fallback as HTMLElement).style.display = "block";
                                        }
                                    }}
                                />
                                <div className="fallback-logo">
                                    <div className="logo-icon">
                                        <div className="brain-icon">🧠</div>
                                        <div className="dumbbell-icon">🏋️</div>
                                    </div>
                                    <h1 className="app-title">
                                        <span className="iron">Iron</span>
                                        <span className="mind">Mind</span>
                                    </h1>
                                </div>
                            </div>
                            <p className="tagline">
                                AI-Powered Personal Training That Learns From You
                            </p>
                        </div>

                        <div className="loading-section">
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                                    <div className="progress-glow" />
                                </div>
                                <div className="progress-text">{Math.round(progress)}%</div>
                            </div>

                            <p className="loading-message">{loadingText}</p>

                            <div className="features-grid">
                                <div className="feature-item">
                                    <div className="feature-icon">🎯</div>
                                    <div className="feature-text">Personalized Recommendations</div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">📈</div>
                                    <div className="feature-text">Adaptive Learning</div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">💡</div>
                                    <div className="feature-text">Smart Programming</div>
                                </div>
                            </div>
                        </div>

                        <div className="pulse-loader">
                            <div className="pulse pulse-1" />
                            <div className="pulse pulse-2" />
                            <div className="pulse pulse-3" />
                        </div>
                    </div>

                    <div className="credits">
                        <p>Powered by Machine Learning & Reinforcement Learning</p>
                    </div>
                </div>
            </div>
        );
    }

    // Optional: if we have an authUserId but user hasn't hydrated yet, show a minimal placeholder.
    // (Prevents protected routes flashing while user is still null.)
    if (authUserId && !user) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "grid", placeItems: "center" }}>
                <div style={{ opacity: 0.8 }}>Loading your profile…</div>
            </div>
        );
    }

    // -------------------------------------------------
    // Routes
    // -------------------------------------------------
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
            <Routes>
                {/* ----------------- PUBLIC ----------------- */}
                {!authUserId && (
                    <>
                        <Route
                            path="/login"
                            element={<AuthContainer onAuthenticated={handleAuthenticated} />}
                        />
                        <Route
                            path="/signup"
                            element={<AuthContainer onAuthenticated={handleAuthenticated} />}
                        />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                )}

                {/* ----------------- PROTECTED ----------------- */}
                {user && (
                    <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/workout" element={<Workout />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route
                            path="/profile"
                            element={
                                <Profile user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
                            }
                        />
                        <Route path="/settings" element={<Settings user={user} />} />
                        <Route path="/friends" element={<Friends user={user} />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                )}
            </Routes>
        </div>
    );
}

export default App;