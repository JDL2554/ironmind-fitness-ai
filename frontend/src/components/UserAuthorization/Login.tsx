import React, { useState } from 'react';
import './Auth.css';

interface LoginProps {
    onLogin: (userData: { email: string; name: string }) => void;
    onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate API call - replace with actual authentication later
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful login
            const userData = {
                email: formData.email,
                name: formData.email.split('@')[0]
            };

            onLogin(userData);
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <img
                        src="/IronMindLogoWithoutText.png"
                        alt="IronMind Logo"
                        className="auth-logo-image"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) {
                                (fallback as HTMLElement).style.display = 'block';
                            }
                        }}
                    />
                    <div className="auth-logo-fallback" style={{ display: 'none' }}>
                        <div className="logo-text">🧠 IronMind</div>
                    </div>
                </div>

                {/* Header */}
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your fitness journey</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {/* Login Form */}
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
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="auth-button primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="button-loading">
                                <div className="spinner-small"></div>
                                Signing In...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* Demo Login */}
                <button
                    onClick={() => onLogin({ email: 'demo@ironmind.ai', name: 'Demo User' })}
                    className="auth-button demo"
                    disabled={loading}
                >
                    🎯 Try Demo Account
                </button>

                {/* Switch to Signup */}
                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <button
                            onClick={onSwitchToSignup}
                            className="auth-link"
                            disabled={loading}
                        >
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>

            {/* Background Elements */}
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