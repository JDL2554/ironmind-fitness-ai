import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Login from "../../pages/Login";
import Signup from "../../pages/Signup";

interface AuthContainerProps {
    onAuthenticated: (userData: { email: string; name: string; experienceLevel?: string }) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthenticated }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isSignup = location.pathname === "/signup";

    const handleLogin = (userData: { email: string; name: string }) => {
        console.log("User logged in:", userData);
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
        console.log("User signed up with full profile:", userData);

        const basicUserData = {
            email: userData.email,
            name: userData.name,
            experienceLevel: userData.experienceLevel,
        };

        onAuthenticated(basicUserData);
    };

    const switchToLogin = () => navigate("/login", { replace: true });
    const switchToSignup = () => navigate("/signup", { replace: true });

    return isSignup ? (
        <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />
    ) : (
        <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />
    );
};

export default AuthContainer;
