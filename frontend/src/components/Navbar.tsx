import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user } = useAuth();

    const src = user?.photo_url ?? "/default-avatar.png"; // whatever fallback you want

    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
            <div>My App</div>

            <img
                src={src}
                alt="profile"
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
            />
        </div>
    );
}
