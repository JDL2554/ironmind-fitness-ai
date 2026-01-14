import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

interface AuthContainerProps {
    onAuthenticated: (userData: { email: string; name: string; experienceLevel?: string }) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthenticated }) => {
    const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');

    const handleLogin = (userData: { email: string; name: string }) => {
        console.log('User logged in:', userData);
        onAuthenticated(userData);
    };

    const handleSignup = (userData: {
        email: string;
        name: string;
        age: number;
        height: string;
        weight: number;
        experienceLevel: string;
        workoutVolume: string;
        goals: string[];
        equipment: string;
    }) => {
        console.log('User signed up with full profile:', userData);
        // Convert to format expected by main app
        const basicUserData = {
            email: userData.email,
            name: userData.name,
            experienceLevel: userData.experienceLevel,
            userProfile: userData // Store full profile for later use
        };
        onAuthenticated(basicUserData);
    };

    const switchToLogin = () => setCurrentView('login');
    const switchToSignup = () => setCurrentView('signup');

    return currentView === "login" ? (
        <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />
    ) : (
        <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />
    );
};

export default AuthContainer;