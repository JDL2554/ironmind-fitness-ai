import React, { useState, useEffect } from 'react';
import AuthContainer from './components/UserAuthorization/AuthContainer';
import './App.css';

interface User {
    email: string;
    name: string;
    experienceLevel?: string;
}

function App() {
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('Initializing IronMind...');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [user, setUser] = useState<User | null>(null);

    const loadingSteps = [
        'Initializing IronMind...',
        'Loading exercise database...',
        'Calibrating AI recommendations...',
        'Preparing reinforcement learning...',
        'Optimizing workout algorithms...',
        'Ready to forge your fitness!'
    ];

    // Loading screen simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + 2;

                // Update loading text based on progress
                const stepIndex = Math.floor((newProgress / 100) * (loadingSteps.length - 1));
                if (stepIndex !== currentStep && stepIndex < loadingSteps.length) {
                    setCurrentStep(stepIndex);
                    setLoadingText(loadingSteps[stepIndex]);
                }

                if (newProgress >= 100) {
                    clearInterval(interval);
                    // End loading after animation completes
                    setTimeout(() => setLoading(false), 1000);
                    return 100;
                }
                return newProgress;
            });
        }, 80);

        return () => clearInterval(interval);
    }, [currentStep]);

    const handleAuthenticated = (userData: User) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    // Show loading screen
    if (loading) {
        return (
            <div className="App">
                <div className="loading-container">
                    {/* Animated Background */}
                    <div className="background-animation">
                        <div className="floating-icon icon-1">💪</div>
                        <div className="floating-icon icon-2">🏋️</div>
                        <div className="floating-icon icon-3">⚡</div>
                        <div className="floating-icon icon-4">🎯</div>
                        <div className="floating-icon icon-5">🧠</div>
                        <div className="floating-icon icon-6">🔥</div>
                    </div>

                    {/* Main Content */}
                    <div className="loading-content">
                        {/* Logo Section */}
                        <div className="logo-section">
                            <div className="main-logo">
                                <img
                                    src="/IronMindLogo.png"
                                    alt="IronMind Logo"
                                    className="logo-image"
                                    onError={(e) => {
                                        // Fallback to text logo if image doesn't load
                                        e.currentTarget.style.display = 'none';
                                        const fallback = document.querySelector('.fallback-logo');
                                        if (fallback) {
                                            (fallback as HTMLElement).style.display = 'block';
                                        }
                                    }}
                                />
                                {/* Fallback logo */}
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
                            <p className="tagline">AI-Powered Personal Training That Learns From You</p>
                        </div>

                        {/* Loading Section */}
                        <div className="loading-section">
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                    <div className="progress-glow"></div>
                                </div>
                                <div className="progress-text">{Math.round(progress)}%</div>
                            </div>

                            <p className="loading-message">{loadingText}</p>

                            {/* Feature Highlights */}
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

                        {/* Pulsing Loader */}
                        <div className="pulse-loader">
                            <div className="pulse pulse-1"></div>
                            <div className="pulse pulse-2"></div>
                            <div className="pulse pulse-3"></div>
                        </div>
                    </div>

                    {/* Bottom Credits */}
                    <div className="credits">
                        <p>Powered by Machine Learning & Reinforcement Learning</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show authentication if no user
    if (!user) {
        return <AuthContainer onAuthenticated={handleAuthenticated} />;
    }

    // Show main app for authenticated user
    return (
        <div className="App">
            <div className="main-app">
                <header className="main-header">
                    <div className="header-content">
                        <div className="logo-section">
                            <img src="/IronMindLogoWithoutText.png" alt="IronMind" className="header-logo" />
                            <h1>IronMind</h1>
                        </div>
                        <div className="user-section">
                            <span>Welcome, {user.name}!</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <div className="dashboard">
                        <h2>🎯 Your AI Fitness Dashboard</h2>
                        <p>Ready to start your personalized workout journey!</p>

                        <div className="dashboard-cards">
                            <div className="dashboard-card">
                                <h3>🏋️ Generate Workout</h3>
                                <p>Get AI-powered exercise recommendations</p>
                                <button className="card-button">Start Workout</button>
                            </div>

                            <div className="dashboard-card">
                                <h3>📊 View Progress</h3>
                                <p>Track your fitness journey and improvements</p>
                                <button className="card-button">View Stats</button>
                            </div>

                            <div className="dashboard-card">
                                <h3>⚙️ Preferences</h3>
                                <p>Customize your AI recommendations</p>
                                <button className="card-button">Settings</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;