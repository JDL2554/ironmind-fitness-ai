import React, { useEffect, useRef, useState } from "react";
import { uploadProfilePhoto } from "../services/Profile";
import { updateProfile } from "../services/Profile";

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
    const [editingEmail, setEditingEmail] = useState(false);
    const [emailDraft, setEmailDraft] = useState(user.email);
    const [emailConfirm, setEmailConfirm] = useState("")

    const photoUrl = user.profile_image_url
        ? user.profile_image_url.startsWith("http")
            ? user.profile_image_url
            : `http://localhost:8000${user.profile_image_url}`
        : null;

    const onPick = () => fileInputRef.current?.click();

    useEffect(() => {
        // keep drafts synced if user changes (login/logout)
        setEmailDraft(user.email);
        setEmailConfirm("");
        setEditingEmail(false);
    }, [user.email]);

    const onEmailEditClick = async () => {
        setErr("");

        if (!editingEmail) {
            setEditingEmail(true);
            setEmailDraft(user.email);
            setEmailConfirm("");
            return;
        }

        // CONFIRM mode:
        const next = emailDraft.trim().toLowerCase();
        const conf = emailConfirm.trim().toLowerCase();

        if (!next) return setErr("Email cannot be empty.");
        if (next !== conf) return setErr("Emails do not match.");

        try {
            const updated = await updateProfile(user.id, { email: next });

            // update global user (top corner + persistence)
            onUserUpdate({
                ...user,
                email: updated.email,
                name: updated.name,
                profile_image_url: updated.profile_image_url ?? user.profile_image_url ?? null,
            });

            setEditingEmail(false);
            setEmailConfirm("");
        } catch (e: any) {
            setErr(e?.message || "Update failed.");
        }
    };

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

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                {/* PROFILE IMAGE */}
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt="Profile"
                        style={{
                            width: 110,
                            height: 110,
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
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

                <div style={{ flex: 1 }}>
                    {/* NAME + EMAIL DISPLAY (UNCHANGED LOOK) */}
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</div>
                    <div style={{ opacity: 0.8, marginTop: 4 }}>{user.email}</div>

                    {/* CHANGE PHOTO BUTTON */}
                    <button
                        onClick={onPick}
                        style={{
                            marginTop: 14,
                            padding: "8px 14px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.92)",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
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

                    {/* EDIT EMAIL SECTION */}
                    <div style={{ marginTop: 28 }}>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                opacity: 0.9,
                                marginBottom: 10,
                            }}
                        >
                            Edit Email
                        </div>

                        {!editingEmail ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input
                                    value={user.email}
                                    disabled
                                    style={{
                                        width: 320,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        background: "rgba(255,255,255,0.04)",
                                        color: "rgba(255,255,255,0.85)",
                                        opacity: 0.75,
                                        outline: "none",
                                    }}
                                />

                                <button
                                    onClick={() => {
                                        setErr("");
                                        setEditingEmail(true);
                                    }}
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        border: "1px solid rgba(255,255,255,0.18)",
                                        background: "rgba(255,255,255,0.06)",
                                        color: "white",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Edit
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <input
                                    value={emailDraft}
                                    onChange={(e) => setEmailDraft(e.target.value)}
                                    placeholder="New email"
                                    style={{
                                        width: 320,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid rgba(255,255,255,0.20)",
                                        background: "rgba(255,255,255,0.08)",
                                        color: "white",
                                        outline: "none",
                                    }}
                                />

                                <input
                                    value={emailConfirm}
                                    onChange={(e) => setEmailConfirm(e.target.value)}
                                    placeholder="Confirm new email"
                                    style={{
                                        width: 320,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid rgba(255,255,255,0.20)",
                                        background: "rgba(255,255,255,0.08)",
                                        color: "white",
                                        outline: "none",
                                    }}
                                />

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        onClick={async () => {
                                            try {
                                                setErr("");

                                                const next = emailDraft.trim().toLowerCase();
                                                const conf = emailConfirm.trim().toLowerCase();

                                                if (!next) return setErr("Email cannot be empty.");
                                                if (next !== conf) return setErr("Emails do not match.");

                                                console.log("CONFIRM CLICKED -> sending PATCH", next);

                                                const updated = await updateProfile(user.id, { email: next });

                                                console.log("PATCH SUCCESS -> updated user:", updated);

                                                onUserUpdate(updated);

                                                setEditingEmail(false);
                                                setEmailConfirm("");
                                            } catch (e: any) {
                                                console.error("PATCH FAILED:", e);
                                                setErr(e?.message || "Update failed.");
                                            }
                                        }}
                                        style={{
                                            padding: "10px 14px",
                                            borderRadius: 10,
                                            border: "1px solid rgba(34,197,94,0.35)",
                                            background: "rgba(34,197,94,0.18)",
                                            color: "white",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Confirm
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingEmail(false);
                                            setEmailDraft(user.email);
                                            setEmailConfirm("");
                                            setErr("");
                                        }}
                                        style={{
                                            padding: "10px 14px",
                                            borderRadius: 10,
                                            border: "1px solid rgba(255,255,255,0.18)",
                                            background: "transparent",
                                            color: "white",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {err && (
                        <div style={{ color: "salmon", marginTop: 16 }}>{err}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
