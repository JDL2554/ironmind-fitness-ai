import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [loadingText, setLoadingText] = useState('Initializing IronMind...');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const loadingSteps = [
        'Initializing IronMind...',
        'Loading exercise database...',
        'Calibrating AI recommendations...',
        'Preparing reinforcement learning...',
        'Optimizing workout algorithms...',
        'Ready to forge your fitness!'
    ];

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
                    return 100;
                }
                return newProgress;
            });
        }, 80);

        return () => clearInterval(interval);
    }, [currentStep]);

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

export default App;