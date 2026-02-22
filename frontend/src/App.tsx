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

function App() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Initializing IronMind...");
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [user, setUser] = useState<User | null>(null);

    // -------------------------------------------------
    // Restore user on refresh
    // -------------------------------------------------
    useEffect(() => {
        const saved = sessionStorage.getItem("ironmind_user");
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch {
                sessionStorage.removeItem("ironmind_user");
            }
        }
    }, []);

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
        setUser(userData);
        sessionStorage.setItem("ironmind_user", JSON.stringify(userData));
        navigate("/dashboard", { replace: true });
    };

    const handleLogout = () => {
        setUser(null);
        sessionStorage.removeItem("ironmind_user");
        navigate("/login", { replace: true });
    };

    const handleUserUpdate = useCallback((nextUser: User) => {
        setUser(nextUser);
        sessionStorage.setItem("ironmind_user", JSON.stringify(nextUser));
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
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <div className="progress-glow" />
                                </div>
                                <div className="progress-text">{Math.round(progress)}%</div>
                            </div>

                            <p className="loading-message">{loadingText}</p>

                            <div className="features-grid">
                                <div className="feature-item">
                                    <div className="feature-icon">🎯</div>
                                    <div className="feature-text">
                                        Personalized Recommendations
                                    </div>
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

    // -------------------------------------------------
    // Routes
    // -------------------------------------------------
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
            <Routes>
                {/* ----------------- PUBLIC ----------------- */}
                {!user && (
                    <>
                        <Route
                            path="/login"
                            element={<AuthContainer onAuthenticated={handleAuthenticated} />}
                        />
                        <Route
                            path="/signup"
                            element={<AuthContainer onAuthenticated={handleAuthenticated} />}
                        />
                        <Route
                            path="/reset-password"
                            element={<ResetPassword />}
                        />
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
                        <Route path="/profile" element={<Profile user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />} />
                        <Route path="/settings" element={<Settings user={user} />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                )}
            </Routes>
        </div>
    );
}

export default App;
