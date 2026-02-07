import React, { useEffect, useRef, useState } from "react";
import { uploadProfilePhoto } from "../services/Profile";

type User = {
    id: number;
    email: string;
    name: string;
    profile_image_url?: string | null;
};

export default function Profile({
                                    user,
                                    onUserUpdate,
                                }: {
    user: User;
    onUserUpdate: (next: User) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [err, setErr] = useState("");

    // ✅ show photo from the user object (so it persists)
    const photoUrl = user.profile_image_url
        ? user.profile_image_url.startsWith("http")
            ? user.profile_image_url
            : `http://localhost:8000${user.profile_image_url}`
        : null;

    const onPick = () => fileInputRef.current?.click();

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setErr("");
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErr("Please choose an image file.");
            e.target.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErr("Image too large (max 5MB).");
            e.target.value = "";
            return;
        }

        try {
            const res = await uploadProfilePhoto(user.id, file);

            // ✅ update global user so it persists + top corner updates
            onUserUpdate({ ...user, profile_image_url: res.profile_image_url });
        } catch (e: any) {
            setErr(e?.message || "Upload failed.");
        } finally {
            e.target.value = "";
        }
    };

    const initials = (user.name || user.email || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    return (
        <div style={{ padding: 24 }}>
            <h1>Profile</h1>

            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt="Profile"
                        style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover" }}
                    />
                ) : (
                    <div
                        style={{
                            width: 110,
                            height: 110,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            background: "#2b2f36",
                            fontSize: 44,
                        }}
                    >
                        {initials || "?"}
                    </div>
                )}

                <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</div>
                    <div style={{ opacity: 0.8 }}>{user.email}</div>

                    <button
                        onClick={onPick}
                        style={{
                            marginTop: 10,
                            padding: "8px 14px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.92)",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "transform 0.12s ease, background 0.12s ease, border-color 0.12s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        Change photo
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={onFileChange}
                    />

                    {err && <div style={{ color: "salmon", marginTop: 8 }}>{err}</div>}
                </div>
            </div>
        </div>
    );
}
