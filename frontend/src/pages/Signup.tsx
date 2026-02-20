// src/pages/Signup.tsx
import React, { useState } from "react";
import "../components/UserAuthorization/Auth.css";
import { signUpApi, emailExistsApi, User, SignupPayload } from "../services/api";

interface SignupProps {
    onSignup: (user: User) => void;   // ✅ now returns id/email/name
    onSwitchToLogin: () => void;
}

type FormState = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;

    age: string;
    height: string;
    weight: string;

    experienceLevel: "beginner" | "intermediate" | "advanced";
    workoutVolume: "1-2" | "3-4" | "5-6" | "7";
    goals: string[];
    equipment: "gym" | "home_full" | "home_basic" | "bodyweight" | "minimal";
    session_length_minutes: "10" | "20" | "30" | "45" | "60" | "75" | "90" | "120" | "150" | "180" | "210" | "240";
};

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormState>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        height: "",
        weight: "",
        experienceLevel: "beginner",
        workoutVolume: "3-4",
        goals: [],
        equipment: "gym",
        session_length_minutes: "60",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [feet, setFeet] = useState("");
    const [inches, setInches] = useState("");

    const goalOptions = [
        { id: "strength", label: "💪 Gain Strength", description: "Build muscle strength and power" },
        { id: "weight_loss", label: "🔥 Lose Weight", description: "Burn fat and lose body weight" },
        { id: "flexibility", label: "🤸 Increase Flexibility", description: "Improve mobility and range of motion" },
        { id: "stamina", label: "🏃 Gain Stamina", description: "Build cardiovascular endurance" },
        { id: "health", label: "❤️ Be Overall Healthier", description: "Improve general health and wellness" },
        { id: "muscle", label: "🏋️ Build Muscle Mass", description: "Increase muscle size and definition" },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleGoalToggle = (goalId: string) => {
        setFormData((s) => {
            const exists = s.goals.includes(goalId);
            return { ...s, goals: exists ? s.goals.filter((g) => g !== goalId) : [...s.goals, goalId] };
        });
        if (error) setError("");
    };

    const setHeightFromParts = (f: string, i: string) => {
        const iNum = i === "" ? "" : String(Math.min(11, Math.max(0, Number(i))));
        const val = f ? `${f}'${iNum === "" ? "0" : iNum}"` : "";
        setFormData((s) => ({ ...s, height: val }));
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1: {
                if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
                    return "Please fill in all fields";
                }
                if (formData.password.length < 6) return "Password must be at least 6 characters";
                if (formData.password !== formData.confirmPassword) return "Passwords do not match";
                break;
            }
            case 2: {
                if (!formData.age || !formData.height || !formData.weight) return "Please fill in all physical information";
                const ageNum = Number(formData.age);
                if (!Number.isFinite(ageNum) || ageNum < 13 || ageNum > 120) return "Please enter a valid age (13-120)";
                const weightNum = Number(formData.weight);
                if (!Number.isFinite(weightNum) || weightNum < 50 || weightNum > 500) return "Please enter a valid weight (50–500 lbs)";

                if (!/^\d+'\d{1,2}"$/.test(formData.height)) return 'Please enter height as feet & inches (e.g., 5\'9")';
                const [fStr, iStr] = formData.height.split(/'|"/).filter(Boolean);
                const fNum = Number(fStr);
                const iNum = Number(iStr);
                if (!(fNum >= 1 && fNum <= 8) || !(iNum >= 0 && iNum <= 11)) return "Height must be between 1–8 ft and 0–11 in";
                break;
            }
            case 3: {
                if (formData.goals.length === 0) return "Please select at least one fitness goal";

                const s = Number(formData.session_length_minutes);
                if (!Number.isFinite(s) || s < 10 || s > 300) return "Please choose a valid session length";
                break;
            }
        }
        return null;
    };

    const handleNext = async () => {
        const validationError = validateStep(currentStep);
        if (validationError) return setError(validationError);

        if (currentStep === 1) {
            setLoading(true);
            setError("");
            try {
                const exists = await emailExistsApi(formData.email);
                if (exists) {
                    setError("An account with this email already exists.");
                    return;
                }
            } catch (e: any) {
                setError(e?.message || "Could not verify email right now. Please try again.");
                return;
            } finally {
                setLoading(false);
            }
        }

        setError("");
        setCurrentStep((s) => s + 1);
    };

    const handleBack = () => {
        setError("");
        setCurrentStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        const validationError = validateStep(3);
        if (validationError) return setError(validationError);

        setLoading(true);
        setError("");
        try {
            const payload: SignupPayload = {
                email: formData.email.trim().toLowerCase(),
                name: formData.name,
                password: formData.password,
                age: Number(formData.age),
                height: formData.height,
                weight: Number(formData.weight),
                experienceLevel: formData.experienceLevel,
                workoutVolume: formData.workoutVolume,
                goals: formData.goals,
                equipment: formData.equipment,

                session_length_minutes: Number(formData.session_length_minutes),
            };

            // ✅ backend returns { id, email, name }
            const user = await signUpApi(payload);

            // ✅ pass back into app so it can store localStorage etc.
            onSignup(user);
        } catch (e: any) {
            setError(e?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {[1, 2, 3].map((step) => (
                <div
                    key={step}
                    className={`step ${step <= currentStep ? "active" : ""} ${step < currentStep ? "completed" : ""}`}
                >
                    <div className="step-number">{step}</div>
                    <div className="step-label">
                        {step === 1 && "Account"}
                        {step === 2 && "Physical"}
                        {step === 3 && "Fitness"}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="signup-step">
            <h3>Create Your Account</h3>
            <p>Let&apos;s start with your basic information</p>

            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="form-input"
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email Address</label>
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
                    placeholder="Create a password (6+ characters)"
                    className="form-input"
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="form-input"
                    disabled={loading}
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="signup-step">
            <h3>Physical Information</h3>
            <p>Help us personalize your workout recommendations</p>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="25"
                        min={13}
                        max={120}
                        className="form-input"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="weight">Weight (lbs)</label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="150"
                        min={50}
                        max={500}
                        step="0.1"
                        className="form-input"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Height</label>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="number"
                        id="height-feet"
                        value={feet}
                        onChange={(e) => {
                            const f = e.target.value;
                            setFeet(f);
                            setHeightFromParts(f, inches);
                        }}
                        placeholder="Feet"
                        min={1}
                        max={8}
                        className="form-input"
                        disabled={loading}
                    />
                    <input
                        type="number"
                        id="height-inches"
                        value={inches}
                        onChange={(e) => {
                            const i = e.target.value;
                            setInches(i);
                            setHeightFromParts(feet, i);
                        }}
                        placeholder="Inches"
                        min={0}
                        max={11}
                        className="form-input"
                        disabled={loading}
                    />
                </div>
                <small style={{ color: "rgba(255,255,255,0.6)" }}>
                    Saved as: {formData.height || "—"}
                </small>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="signup-step">
            <h3>Fitness Profile</h3>
            <p>Tell us about your fitness background and goals</p>

            <div className="form-group">
                <label htmlFor="experienceLevel">Fitness Experience Level</label>
                <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                >
                    <option value="beginner">🌱 Beginner (0-1 years)</option>
                    <option value="intermediate">💪 Intermediate (1-3 years)</option>
                    <option value="advanced">🏆 Advanced (3+ years)</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="workoutVolume">Desired Workout Frequency</label>
                <select
                    id="workoutVolume"
                    name="workoutVolume"
                    value={formData.workoutVolume}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                >
                    <option value="1-2">🚶 1-2 days per week</option>
                    <option value="3-4">🏃 3-4 days per week</option>
                    <option value="5-6">🏋️ 5-6 days per week</option>
                    <option value="7">💪 Daily (7 days)</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="equipment">Equipment Access</label>
                <select
                    id="equipment"
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                >
                    <option value="gym">🏋️ Gym Access</option>
                    <option value="home_full">🏠 Home Gym (Full)</option>
                    <option value="home_basic">🏠 Home Gym (Basic)</option>
                    <option value="bodyweight">🤸 Bodyweight Only</option>
                    <option value="minimal">🎒 Minimal Equipment</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="session_length_minutes">Preferred Session Length</label>
                <select
                    id="session_length_minutes"
                    name="session_length_minutes"
                    value={formData.session_length_minutes}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                >
                    <option value="10">⏱️ 10 minutes</option>
                    <option value="20">⏱️ 20 minutes</option>
                    <option value="30">⏱️ 30 minutes</option>
                    <option value="45">⏱️ 45 minutes</option>
                    <option value="60">⏱️ 60 minutes</option>
                    <option value="75">⏱️ 75 minutes</option>
                    <option value="90">⏱️ 90 minutes</option>
                    <option value="120">⏱️ 120 minutes</option>
                    <option value="150">⏱️ 150 minutes</option>
                    <option value="180">⏱️ 180 minutes</option>
                    <option value="210">⏱️ 210 minutes</option>
                    <option value="240">⏱️ 240 minutes</option>

                </select>
            </div>

            <div className="form-group">
                <label>Fitness Goals (Select all that apply)</label>
                <div className="goals-grid">
                    {goalOptions.map((goal) => (
                        <div
                            key={goal.id}
                            className={`goal-option ${formData.goals.includes(goal.id) ? "selected" : ""}`}
                            onClick={() => handleGoalToggle(goal.id)}
                        >
                            <div className="goal-header">
                                <span className="goal-label">{goal.label}</span>
                                <div className="goal-checkbox">{formData.goals.includes(goal.id) ? "✓" : "+"}</div>
                            </div>
                            <p className="goal-description">{goal.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="auth-container">
            <div className="auth-card signup-card">
                <div className="auth-logo">
                    <img src="/IronMindLogoWithoutText.png" alt="IronMind Logo" className="auth-logo-image" />
                    <div className="auth-logo-fallback" style={{ display: "none" }}>
                        <div className="logo-text">🧠 IronMind</div>
                    </div>
                </div>

                {renderStepIndicator()}

                <div className="auth-header">
                    <h2>Join IronMind</h2>
                    <p>Step {currentStep} of 3 - Create your personalized fitness profile</p>
                </div>

                {error && <div className="error-message">⚠️ {error}</div>}

                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                <div className="form-navigation">
                    {currentStep > 1 && (
                        <button onClick={handleBack} className="auth-button secondary" disabled={loading}>
                            ← Back
                        </button>
                    )}

                    {currentStep < 3 ? (
                        <button onClick={handleNext} className="auth-button primary" disabled={loading}>
                            Next →
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="auth-button primary" disabled={loading}>
                            {loading ? (
                                <div className="button-loading">
                                    <div className="spinner-small"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    )}
                </div>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <button onClick={onSwitchToLogin} className="auth-link" disabled={loading}>
                            Sign In
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

export default Signup;
