// src/pages/Login.tsx
import React, { useState } from "react";
import "../components/UserAuthorization/Auth.css";
import { loginApi, User } from "../services/api";

interface LoginProps {
    onLogin: (userData: User) => void;
    onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const user = await loginApi(formData.email, formData.password);
            onLogin(user);
        } catch (err: any) {
            setError(err?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <img
                        src="/IronMindLogoWithoutText.png"
                        alt="IronMind Logo"
                        className="auth-logo-image"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) (fallback as HTMLElement).style.display = "block";
                        }}
                    />
                    <div className="auth-logo-fallback" style={{ display: "none" }}>
                        <div className="logo-text">🧠 IronMind</div>
                    </div>
                </div>

                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your fitness journey</p>
                </div>

                {error && <div className="error-message">⚠️ {error}</div>}

                <div className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className="form-input"
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            className="form-input"
                            disabled={loading}
                            autoComplete="current-password"
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    </div>

                    <button onClick={handleSubmit} className="auth-button primary" disabled={loading}>
                        {loading ? (
                            <div className="button-loading">
                                <div className="spinner-small"></div>
                                Signing In...
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        Don&apos;t have an account?{" "}
                        <button onClick={onSwitchToSignup} className="auth-link" disabled={loading}>
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>

            <div className="auth-background">
                <div className="floating-element element-1">💪</div>
                <div className="floating-element element-2">🧠</div>
                <div className="floating-element element-3">⚡</div>
                <div className="floating-element element-4">🏋️</div>
            </div>
        </div>
    );
};

export default Login;
