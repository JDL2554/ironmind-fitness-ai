import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Login from "../../pages/Login";
import Signup from "../../pages/Signup";
import type { User } from "../../services/api";

interface AuthContainerProps {
    onAuthenticated: (userData: User) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthenticated }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isSignup = location.pathname === "/signup";

    const handleLogin = (userData: User) => {
        console.log("User logged in:", userData);
        onAuthenticated(userData);
    };

    const handleSignup = (userData: User) => {
        console.log("User signed up:", userData);
        onAuthenticated(userData);
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
