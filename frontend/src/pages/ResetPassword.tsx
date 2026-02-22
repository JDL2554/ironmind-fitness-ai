import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordApi } from "../services/api"

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const token = useMemo(() => params.get("token") || "", [params]);

    const [pw1, setPw1] = useState("");
    const [pw2, setPw2] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [success, setSuccess] = useState(false);


    const onSubmit = async () => {
        setMsg("");
        setSuccess(false);

        if (!token) return setMsg("Missing reset token.");
        if (!pw1) return setMsg("Password cannot be empty.");
        if (pw1 !== pw2) return setMsg("Passwords do not match.");

        setLoading(true);

        try {
            await resetPasswordApi(token, pw1, pw2);

            setSuccess(true);
            setMsg("Password successfully updated!");
            setTimeout(() => navigate("/login", { replace: true }), 1500);
        } catch (e: any) {
            setSuccess(false);
            setMsg(e?.message || "Reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Choose a new password for your account</p>
                </div>

                {msg && (
                    <div className={success ? "success-message" : "error-message"}>
                        {success ? "✅" : "⚠️"} {msg}
                    </div>
                )}

                <div className="auth-form">
                    <div className="form-group">
                        <label htmlFor="pw1">New Password</label>
                        <input
                            id="pw1"
                            type="password"
                            value={pw1}
                            onChange={(e) => setPw1(e.target.value)}
                            className="form-input"
                            placeholder="Enter new password"
                            disabled={loading}
                            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pw2">Confirm Password</label>
                        <input
                            id="pw2"
                            type="password"
                            value={pw2}
                            onChange={(e) => setPw2(e.target.value)}
                            className="form-input"
                            placeholder="Confirm new password"
                            disabled={loading}
                            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                            autoComplete="new-password"
                        />
                    </div>

                    <button onClick={onSubmit} className="auth-button primary" disabled={loading}>
                        {loading ? "Updating…" : "Update Password"}
                    </button>

                    <div className="auth-footer" style={{ marginTop: 12 }}>
                        <button
                            className="auth-link"
                            onClick={() => navigate("/login")}
                            disabled={loading}
                            style={{ background: "transparent" }}
                        >
                            Back to Login
                        </button>
                    </div>
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
}
