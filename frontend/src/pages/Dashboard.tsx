import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
        <div className="dashboard">
            <h2>🎯 Your AI Fitness Dashboard</h2>
            <p>Ready to start your personalized workout journey!</p>

            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <h3>🏋️ Generate Workout</h3>
                    <p>Get AI-powered exercise recommendations</p>
                    <Link to="/workout" className="card-button">
                        Start Workout
                    </Link>
                </div>

                <div className="dashboard-card">
                    <h3>📊 View Progress</h3>
                    <p>Track your fitness journey and improvements</p>
                    <Link to="/progress" className="card-button">
                        View Stats
                    </Link>
                </div>

                <div className="dashboard-card">
                    <h3>⚙️ Preferences</h3>
                    <p>Customize your AI recommendations</p>
                    <Link to="/settings" className="card-button">
                        Settings
                    </Link>
                </div>
            </div>
        </div>
    );
}
