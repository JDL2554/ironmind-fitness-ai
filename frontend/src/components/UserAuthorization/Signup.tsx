import React, { useState } from 'react';
import './Auth.css';

interface SignupProps {
    onSignup: (userData: { experienceLevel: string; workoutVolume: string; name: string; weight: number; equipment: string; email: string; age: number; height: string; goals: string[] }) => void;
    onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Account Info
        name: '',
        email: '',
        password: '',
        confirmPassword: '',

        // Step 2: Physical Info
        age: '',
        height: '',
        weight: '',

        // Step 3: Fitness Profile
        experienceLevel: 'beginner',
        workoutVolume: '3-4',
        goals: [] as string[],
        equipment: 'gym'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [feet, setFeet] = useState("");
    const [inches, setInches] = useState("");

    const goalOptions = [
        { id: 'strength', label: '💪 Gain Strength', description: 'Build muscle strength and power' },
        { id: 'weight_loss', label: '🔥 Lose Weight', description: 'Burn fat and lose body weight' },
        { id: 'flexibility', label: '🤸 Increase Flexibility', description: 'Improve mobility and range of motion' },
        { id: 'stamina', label: '🏃 Gain Stamina', description: 'Build cardiovascular endurance' },
        { id: 'health', label: '❤️ Be Overall Healthier', description: 'Improve general health and wellness' },
        { id: 'muscle', label: '🏋️ Build Muscle Mass', description: 'Increase muscle size and definition' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleGoalToggle = (goalId: string) => {
        const currentGoals = [...formData.goals];
        const index = currentGoals.indexOf(goalId);

        if (index === -1) {
            currentGoals.push(goalId);
        } else {
            currentGoals.splice(index, 1);
        }

        setFormData({ ...formData, goals: currentGoals });
        if (error) setError('');
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!formData.name || !formData.email || !formData.password) {
                    return 'Please fill in all fields';
                }
                if (formData.password.length < 6) {
                    return 'Password must be at least 6 characters';
                }
                if (formData.password !== formData.confirmPassword) {
                    return 'Passwords do not match';
                }
                break;
            case 2:
                if (!formData.age || !formData.height || !formData.weight) {
                    return 'Please fill in all physical information';
                }
                if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
                    return 'Please enter a valid age (13-120)';
                }
                if (!formData.height.match(/^\d+'?\d*"?$|^\d+\s*(cm|kg)$/i)) {
                    return 'Please enter height in format: 5\'10" or 178cm';
                }
                break;
            case 3:
                if (formData.goals.length === 0) {
                    return 'Please select at least one fitness goal';
                }
                break;
        }
        return null;
    };

    const handleNext = () => {
        const validationError = validateStep(currentStep);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setError('');
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        const validationError = validateStep(3);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const userData = {
                email: formData.email,
                name: formData.name,
                age: parseInt(formData.age),
                height: formData.height,
                weight: parseFloat(formData.weight), // Convert string to number
                experienceLevel: formData.experienceLevel,
                workoutVolume: formData.workoutVolume,
                goals: formData.goals,
                equipment: formData.equipment
            };

            onSignup(userData);
        } catch (err) {
            setError('Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {[1, 2, 3].map(step => (
                <div
                    key={step}
                    className={`step ${step <= currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
                >
                    <div className="step-number">{step}</div>
                    <div className="step-label">
                        {step === 1 && 'Account'}
                        {step === 2 && 'Physical'}
                        {step === 3 && 'Fitness'}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="signup-step">
            <h3>Create Your Account</h3>
            <p>Let's start with your basic information</p>

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
                        min="13"
                        max="120"
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
                        min="50"
                        max="500"
                        step="0.1"
                        className="form-input"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="height">Height</label>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="number"
                        id="height-feet"
                        value={feet}
                        onChange={(e) => {
                            const f = e.target.value;
                            setFeet(f);
                            setFormData({
                                ...formData,
                                height: f && inches ? `${f}'${inches}"` : f ? `${f}'` : ""
                            });
                        }}
                        placeholder="Feet"
                        min="1"
                        max="8"
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
                            setFormData({
                                ...formData,
                                height: feet && i ? `${feet}'${i}"` : feet ? `${feet}'` : ""
                            });
                        }}
                        placeholder="Inches"
                        min="0"
                        max="11"
                        className="form-input"
                        disabled={loading}
                    />
                </div>
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
                    <option value="gym">🏢 Full Gym Access</option>
                    <option value="home_full">🏠 Home Gym (Full Equipment)</option>
                    <option value="home_basic">🏠 Home Gym (Basic Equipment)</option>
                    <option value="bodyweight">💪 Bodyweight Only</option>
                    <option value="minimal">🎒 Minimal Equipment (Resistance Bands, Dumbbells)</option>
                </select>
            </div>

            <div className="form-group">
                <label>Fitness Goals (Select all that apply)</label>
                <div className="goals-grid">
                    {goalOptions.map(goal => (
                        <div
                            key={goal.id}
                            className={`goal-option ${formData.goals.includes(goal.id) ? 'selected' : ''}`}
                            onClick={() => handleGoalToggle(goal.id)}
                        >
                            <div className="goal-header">
                                <span className="goal-label">{goal.label}</span>
                                <div className="goal-checkbox">
                                    {formData.goals.includes(goal.id) ? '✓' : '+'}
                                </div>
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
                {/* Logo */}
                <div className="auth-logo">
                    <img
                        src="/IronMindLogoWithoutText.png"
                        alt="IronMind Logo"
                        className="auth-logo-image"
                    />
                    <div className="auth-logo-fallback" style={{ display: 'none' }}>
                        <div className="logo-text">🧠 IronMind</div>
                    </div>
                </div>

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Header */}
                <div className="auth-header">
                    <h2>Join IronMind</h2>
                    <p>Step {currentStep} of 3 - Create your personalized fitness profile</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {/* Step Content */}
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                {/* Navigation Buttons */}
                <div className="form-navigation">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="auth-button secondary"
                            disabled={loading}
                        >
                            ← Back
                        </button>
                    )}

                    {currentStep < 3 ? (
                        <button
                            onClick={handleNext}
                            className="auth-button primary"
                            disabled={loading}
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="auth-button primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="button-loading">
                                    <div className="spinner-small"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    )}
                </div>

                {/* Switch to Login */}
                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="auth-link"
                            disabled={loading}
                        >
                            Sign In
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

export default Signup;