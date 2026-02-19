import React, { useEffect, useRef, useState } from "react";
import { uploadProfilePhoto, updateProfile, changePassword } from "../services/Profile";

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
    const [pwMsg, setPwMsg] = useState("");

    // Email edit state
    const [editingEmail, setEditingEmail] = useState(false);
    const [emailDraft, setEmailDraft] = useState(user.email);
    const [emailConfirm, setEmailConfirm] = useState("");

    // Name edit state
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState(user.name);

    // Password edit state
    const [editingPassword, setEditingPassword] = useState(false);
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [newPw2, setNewPw2] = useState("");

    useEffect(() => {
        // Reset drafts when parent user changes (login/logout/update)
        setEmailDraft(user.email);
        setEmailConfirm("");
        setEditingEmail(false);

        setNameDraft(user.name);
        setEditingName(false);

        setEditingPassword(false);
        setOldPw("");
        setNewPw("");
        setNewPw2("");
        setPwMsg("");

        setErr("");
    }, [user.email, user.name]);

    const photoUrl = user.profile_image_url
        ? user.profile_image_url.startsWith("http")
            ? user.profile_image_url
            : `http://localhost:8000${user.profile_image_url}`
        : null;

    const initials = (user.name || user.email || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

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
            onUserUpdate({ ...user, profile_image_url: res.profile_image_url });
        } catch (e: any) {
            setErr(e?.message || "Upload failed.");
        } finally {
            e.target.value = "";
        }
    };

    // ---- shared inline styles ----
    const labelStyle: React.CSSProperties = {
        fontSize: 14,
        fontWeight: 700,
        opacity: 0.9,
        marginBottom: 10,
    };

    const disabledInputStyle: React.CSSProperties = {
        width: 320,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.04)",
        color: "rgba(255,255,255,0.85)",
        opacity: 0.75,
        outline: "none",
    };

    const activeInputStyle: React.CSSProperties = {
        width: 320,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.20)",
        background: "rgba(255,255,255,0.08)",
        color: "white",
        outline: "none",
    };

    const editBtnStyle: React.CSSProperties = {
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
    };

    const confirmBtnStyle: React.CSSProperties = {
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(34,197,94,0.35)",
        background: "rgba(34,197,94,0.18)",
        color: "white",
        fontWeight: 700,
        cursor: "pointer",
    };

    const cancelBtnStyle: React.CSSProperties = {
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "transparent",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Profile</h1>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                {/* PROFILE IMAGE */}
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

                <div style={{ flex: 1 }}>
                    {/* NAME + EMAIL DISPLAY */}
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

                    {/* EDIT NAME */}
                    <div style={{ marginTop: 22 }}>
                        <div style={labelStyle}>Edit Name</div>

                        {!editingName ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input value={user.name} disabled style={disabledInputStyle} />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErr("");
                                        setEditingName(true);
                                        setNameDraft(user.name);
                                    }}
                                    style={editBtnStyle}
                                >
                                    Edit
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        setErr("");
                                        const nextName = nameDraft.trim();
                                        if (!nextName) return setErr("Name cannot be empty.");

                                        const updated = await updateProfile(user.id, { name: nextName });

                                        onUserUpdate({
                                            ...user,
                                            name: updated.name,
                                            email: updated.email ?? user.email,
                                            profile_image_url: updated.profile_image_url ?? user.profile_image_url ?? null,
                                        });

                                        setEditingName(false);
                                    } catch (e: any) {
                                        setErr(e?.message || "Update failed.");
                                    }
                                }}
                                style={{ display: "flex", flexDirection: "column", gap: 10 }}
                            >
                                <input
                                    value={nameDraft}
                                    onChange={(e) => setNameDraft(e.target.value)}
                                    placeholder="New name"
                                    style={activeInputStyle}
                                />

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button type="submit" style={confirmBtnStyle}>
                                        Confirm
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setErr("");
                                            setEditingName(false);
                                            setNameDraft(user.name);
                                        }}
                                        style={cancelBtnStyle}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* EDIT EMAIL */}
                    <div style={{ marginTop: 28 }}>
                        <div style={labelStyle}>Edit Email</div>

                        {!editingEmail ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input value={user.email} disabled style={disabledInputStyle} />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErr("");
                                        setEditingEmail(true);
                                        setEmailDraft(user.email);
                                        setEmailConfirm("");
                                    }}
                                    style={editBtnStyle}
                                >
                                    Edit
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        setErr("");

                                        const next = emailDraft.trim().toLowerCase();
                                        const conf = emailConfirm.trim().toLowerCase();

                                        if (!next) return setErr("Email cannot be empty.");
                                        if (next !== conf) return setErr("Emails do not match.");

                                        const updated = await updateProfile(user.id, { email: next });

                                        onUserUpdate({
                                            ...user,
                                            email: updated.email,
                                            name: updated.name ?? user.name,
                                            profile_image_url: updated.profile_image_url ?? user.profile_image_url ?? null,
                                        });

                                        setEditingEmail(false);
                                        setEmailConfirm("");
                                    } catch (e: any) {
                                        setErr(e?.message || "Update failed.");
                                    }
                                }}
                                style={{ display: "flex", flexDirection: "column", gap: 10 }}
                            >
                                <input
                                    value={emailDraft}
                                    onChange={(e) => setEmailDraft(e.target.value)}
                                    placeholder="New email"
                                    style={activeInputStyle}
                                />

                                <input
                                    value={emailConfirm}
                                    onChange={(e) => setEmailConfirm(e.target.value)}
                                    placeholder="Confirm new email"
                                    style={activeInputStyle}
                                />

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button type="submit" style={confirmBtnStyle}>
                                        Confirm
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingEmail(false);
                                            setEmailDraft(user.email);
                                            setEmailConfirm("");
                                            setErr("");
                                        }}
                                        style={cancelBtnStyle}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* CHANGE PASSWORD */}
                    <div style={{ marginTop: 28 }}>
                        <div style={labelStyle}>Change Password</div>

                        {!editingPassword ? (
                            <button
                                onClick={() => {
                                    setErr("");
                                    setPwMsg("");
                                    setEditingPassword(true);
                                    setOldPw("");
                                    setNewPw("");
                                    setNewPw2("");
                                }}
                                style={editBtnStyle}
                            >
                                Change password
                            </button>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <input
                                    type="password"
                                    value={oldPw}
                                    onChange={(e) => setOldPw(e.target.value)}
                                    placeholder="Old password"
                                    style={activeInputStyle}
                                />

                                <input
                                    type="password"
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    placeholder="New password (min 8 chars)"
                                    style={activeInputStyle}
                                />

                                <input
                                    type="password"
                                    value={newPw2}
                                    onChange={(e) => setNewPw2(e.target.value)}
                                    placeholder="Confirm new password"
                                    style={activeInputStyle}
                                />

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        id="pwConfirmBtn"
                                        onClick={async () => {
                                            try {
                                                setErr("");
                                                setPwMsg("");

                                                if (!oldPw) return setErr("Enter your old password.");
                                                if (newPw.length < 8)
                                                    return setErr("New password must be at least 8 characters.");
                                                if (newPw !== newPw2) return setErr("New passwords do not match.");
                                                if (oldPw === newPw)
                                                    return setErr("New password must be different from old password.");

                                                await changePassword(user.id, oldPw, newPw, newPw2);

                                                setPwMsg("Password updated.");
                                                setEditingPassword(false);
                                                setOldPw("");
                                                setNewPw("");
                                                setNewPw2("");
                                            } catch (e: any) {
                                                setErr(e?.message || "Password update failed.");
                                            }
                                        }}
                                        style={confirmBtnStyle}
                                    >
                                        Confirm
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingPassword(false);
                                            setOldPw("");
                                            setNewPw("");
                                            setNewPw2("");
                                            setErr("");
                                            setPwMsg("");
                                        }}
                                        style={cancelBtnStyle}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {pwMsg && <div style={{ marginTop: 10, color: "lightgreen" }}>{pwMsg}</div>}
                            </div>
                        )}
                    </div>

                    {err && <div style={{ color: "salmon", marginTop: 16 }}>{err}</div>}
                </div>
            </div>
        </div>
    );
}
