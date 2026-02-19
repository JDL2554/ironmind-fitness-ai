import React, { useEffect, useRef, useState } from "react";
import { uploadProfilePhoto, updateProfile, changePassword, getProfile, updateUserStats } from "../services/Profile";


interface User {
    id: number;
    email: string;
    name: string;

    age?: number;
    height?: string;
    weight?: number;

    experienceLevel?: string;
    workoutVolume?: string;
    goals?: string[];
    equipment?: string;

    profile_image_url?: string | null;
    created_at?: string | null;
    friend_code?: string;
}

const EXPERIENCE_OPTIONS = [
    { value: "beginner", label: "🌱 Beginner (0-1 years)" },
    { value: "intermediate", label: "💪 Intermediate (1-3 years)" },
    { value: "advanced", label: "🏆 Advanced (3+ years)" },
] as const;

const WORKOUT_VOLUME_OPTIONS = [
    { value: "1-2", label: "🚶 1-2 days per week" },
    { value: "3-4", label: "🏃 3-4 days per week" },
    { value: "5-6", label: "🏋️ 5-6 days per week" },
    { value: "7", label: "💪 Daily (7 days)" },
] as const;

const EQUIPMENT_OPTIONS = [
    { value: "gym", label: "🏋️ Gym Access" },
    { value: "home_full", label: "🏠 Home Gym (Full)" },
    { value: "home_basic", label: "🏠 Home Gym (Basic)" },
    { value: "bodyweight", label: "🤸 Bodyweight Only" },
    { value: "minimal", label: "🎒 Minimal Equipment" },
] as const;

const goalOptions = [
    { id: "strength", label: "💪 Gain Strength", description: "Build muscle strength and power" },
    { id: "weight_loss", label: "🔥 Lose Weight", description: "Burn fat and lose body weight" },
    { id: "flexibility", label: "🤸 Increase Flexibility", description: "Improve mobility and range of motion" },
    { id: "stamina", label: "🏃 Gain Stamina", description: "Build cardiovascular endurance" },
    { id: "health", label: "❤️ Be Overall Healthier", description: "Improve general health and wellness" },
    { id: "muscle", label: "🏋️ Build Muscle Mass", description: "Increase muscle size and definition" },
];

type GoalId = typeof goalOptions[number]["id"];

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

    const [editingStats, setEditingStats] = useState(false);

    const [ageDraft, setAgeDraft] = useState(user.age?.toString() ?? "");
    const [feetDraft, setFeetDraft] = useState("");
    const [inchesDraft, setInchesDraft] = useState("");
    const [weightDraft, setWeightDraft] = useState(user.weight?.toString() ?? "");

    const [expDraft, setExpDraft] = useState(user.experienceLevel ?? "");
    const [volDraft, setVolDraft] = useState(user.workoutVolume ?? "");
    const [equipDraft, setEquipDraft] = useState(user.equipment ?? "");
    const [goalsDraft, setGoalsDraft] = useState<GoalId[]>(
        (user.goals ?? []) as GoalId[]
    );
    const goalLabelById = new Map(goalOptions.map(g => [g.id, g.label]));

    const [copied, setCopied] = useState(false);

    const [savingName, setSavingName] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [savingStats, setSavingStats] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [statsSavedMsg, setStatsSavedMsg] = useState("");
    const [nameSavedMsg, setNameSavedMsg] = useState("");
    const [emailSavedMsg, setEmailSavedMsg] = useState("");
    const [pwSavedMsg, setPwSavedMsg] = useState("");

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

        setEditingStats(false);
        setAgeDraft(user.age?.toString() ?? "");
        const h = user.height ?? "";
        const m = h.match(/^(\d+)'\s*(\d+)"$/);
        setFeetDraft(m ? m[1] : "");
        setInchesDraft(m ? m[2] : "");

        setWeightDraft(user.weight?.toString() ?? "");
        setExpDraft(user.experienceLevel ?? "");
        setVolDraft(user.workoutVolume ?? "");
        setEquipDraft(user.equipment ?? "");
        setGoalsDraft(user.goals ?? []);

        setErr("");
    }, [user]);

    useEffect(() => {
        (async () => {
            try {
                const full = await getProfile(user.id);
                onUserUpdate(full);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [user.id, onUserUpdate]);

    const copyFriendCode = async () => {
        const raw = (user.friend_code || "").trim();
        if (!raw) return;

        const text = `#${raw}`;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // fallback for some browsers / permissions
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }
    };

    const formattedCreatedAt = user.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    const toggleGoal = (id: GoalId) => {
        setGoalsDraft((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const disabledBtnStyle: React.CSSProperties = {
        opacity: 0.6,
        cursor: "not-allowed",
    };

    const spinnerStyle: React.CSSProperties = {
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "white",
        animation: "spin 0.9s linear infinite",
    };

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

    const onPick = () => {
        if (uploadingPhoto) return;
        fileInputRef.current?.click();
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

        setUploadingPhoto(true);
        try {
            const res = await uploadProfilePhoto(user.id, file);
            onUserUpdate({ ...user, profile_image_url: res.profile_image_url });
        } catch (e: any) {
            setErr(e?.message || "Upload failed.");
        } finally {
            setUploadingPhoto(false);
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
            <style>
                {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
            </style>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</div>

                        {user.friend_code && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 600 }}>
                                    #{user.friend_code}
                                  </span>

                                <button
                                    type="button"
                                    onClick={copyFriendCode}
                                    title={copied ? "Copied!" : "Copy friend code"}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        padding: 0,
                                        margin: 0,
                                        cursor: "pointer",
                                        color: "rgba(255,255,255,0.55)",
                                        display: "grid",
                                        placeItems: "center",
                                    }}
                                >
                                    {/* copy icon */}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 9h10v10H9V9Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                {copied && (
                                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                                      Copied
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ opacity: 0.8, marginTop: 4 }}>{user.email}</div>

                    {/* CHANGE PHOTO BUTTON */}
                    <button
                        onClick={onPick}
                        disabled={uploadingPhoto}
                        style={{
                            marginTop: 14,
                            padding: "8px 14px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.92)",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: uploadingPhoto ? "not-allowed" : "pointer",
                            opacity: uploadingPhoto ? 0.7 : 1,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        {uploadingPhoto ? (
                            <>
                                <span style={spinnerStyle} />
                                Uploading...
                            </>
                        ) : (
                            "Change photo"
                        )}
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
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setErr("");
                                            setNameSavedMsg("");
                                            setEditingName(true);
                                            setNameDraft(user.name);
                                        }}
                                        style={editBtnStyle}
                                    >
                                        Edit
                                    </button>

                                    {nameSavedMsg && (
                                        <div style={{ color: "#4ade80", fontWeight: 700 }}>{nameSavedMsg}</div>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (savingName) return;

                                    try {
                                        setErr("");
                                        setNameSavedMsg("");
                                        const nextName = nameDraft.trim();
                                        if (!nextName) return setErr("Name cannot be empty.");

                                        setSavingName(true);

                                        const updated = await updateProfile(user.id, { name: nextName });

                                        onUserUpdate({
                                            ...user,
                                            name: updated.name,
                                            email: updated.email ?? user.email,
                                            profile_image_url: updated.profile_image_url ?? user.profile_image_url ?? null,
                                        });

                                        setEditingName(false);

                                        setNameSavedMsg("Saved!");
                                        window.setTimeout(() => setNameSavedMsg(""), 1600);
                                    } catch (e: any) {
                                        setErr(e?.message || "Update failed.");
                                    } finally {
                                        setSavingName(false);
                                    }
                                }}
                                style={{ display: "flex", flexDirection: "column", gap: 10 }}
                            >
                                <input
                                    value={nameDraft}
                                    onChange={(e) => setNameDraft(e.target.value)}
                                    placeholder="New name"
                                    style={activeInputStyle}
                                    disabled={savingName}
                                />

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        type="submit"
                                        disabled={savingName}
                                        style={{ ...confirmBtnStyle, ...(savingName ? disabledBtnStyle : {}) }}
                                    >
                                        {savingName ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                              <span style={spinnerStyle} />
                                              Saving...
                                            </span>
                                        ) : (
                                            "Confirm"
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={savingName}
                                        onClick={() => {
                                            if (savingName) return;
                                            setErr("");
                                            setEditingName(false);
                                            setNameDraft(user.name);
                                        }}
                                        style={{ ...cancelBtnStyle, ...(savingName ? disabledBtnStyle : {}) }}
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
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setErr("");
                                            setEmailSavedMsg("");
                                            setEditingEmail(true);
                                            setEmailDraft(user.email);
                                            setEmailConfirm("");
                                        }}
                                        style={editBtnStyle}
                                    >
                                        Edit
                                    </button>

                                    {emailSavedMsg && (
                                        <div style={{ color: "#4ade80", fontWeight: 700 }}>{emailSavedMsg}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (savingEmail) return;

                                    try {
                                        setErr("");
                                        setEmailSavedMsg("");

                                        const next = emailDraft.trim().toLowerCase();
                                        const conf = emailConfirm.trim().toLowerCase();

                                        if (!next) return setErr("Email cannot be empty.");
                                        if (next !== conf) return setErr("Emails do not match.");

                                        setSavingEmail(true);

                                        const updated = await updateProfile(user.id, { email: next });

                                        onUserUpdate({
                                            ...user,
                                            email: updated.email,
                                            name: updated.name ?? user.name,
                                            profile_image_url: updated.profile_image_url ?? user.profile_image_url ?? null,
                                        });

                                        setEditingEmail(false);
                                        setEmailConfirm("");

                                        setEmailSavedMsg("Saved!");
                                        window.setTimeout(() => setEmailSavedMsg(""), 1600);
                                    } catch (e: any) {
                                        setErr(e?.message || "Update failed.");
                                    } finally {
                                        setSavingEmail(false);
                                    }
                                }}
                                style={{ display: "flex", flexDirection: "column", gap: 10 }}
                            >
                                <input
                                    value={emailDraft}
                                    onChange={(e) => setEmailDraft(e.target.value)}
                                    placeholder="New email"
                                    style={activeInputStyle}
                                    disabled={savingEmail}
                                />

                                <input
                                    value={emailConfirm}
                                    onChange={(e) => setEmailConfirm(e.target.value)}
                                    placeholder="Confirm new email"
                                    style={activeInputStyle}
                                    disabled={savingEmail}
                                />

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        type="submit"
                                        disabled={savingEmail}
                                        style={{ ...confirmBtnStyle, ...(savingEmail ? disabledBtnStyle : {}) }}
                                    >
                                        {savingEmail ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                              <span style={spinnerStyle} />
                                              Saving...
                                            </span>
                                        ) : (
                                            "Confirm"
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={savingEmail}
                                        onClick={() => {
                                            if (savingEmail) return;
                                            setEditingEmail(false);
                                            setEmailDraft(user.email);
                                            setEmailConfirm("");
                                            setErr("");
                                        }}
                                        style={{ ...cancelBtnStyle, ...(savingEmail ? disabledBtnStyle : {}) }}
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
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <button
                                    onClick={() => {
                                        setErr("");
                                        setPwMsg("");
                                        setPwSavedMsg("");
                                        setEditingPassword(true);
                                        setOldPw("");
                                        setNewPw("");
                                        setNewPw2("");
                                    }}
                                    style={editBtnStyle}
                                >
                                    Change password
                                </button>

                                {pwSavedMsg && (
                                    <div style={{ color: "#4ade80", fontWeight: 700 }}>{pwSavedMsg}</div>
                                )}
                            </div>
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
                                        disabled={savingPw}
                                        onClick={async () => {
                                            if (savingPw) return;

                                            try {
                                                setErr("");
                                                setPwMsg("");
                                                setPwSavedMsg("");

                                                if (!oldPw) return setErr("Enter your old password.");
                                                if (newPw.length < 8) return setErr("New password must be at least 8 characters.");
                                                if (newPw !== newPw2) return setErr("New passwords do not match.");
                                                if (oldPw === newPw) return setErr("New password must be different from old password.");

                                                setSavingPw(true);

                                                await changePassword(user.id, oldPw, newPw, newPw2);

                                                setPwMsg("Password updated.");
                                                setEditingPassword(false);
                                                setOldPw("");
                                                setNewPw("");
                                                setNewPw2("");

                                                setPwSavedMsg("Saved!");
                                                window.setTimeout(() => setPwSavedMsg(""), 1600);
                                            } catch (e: any) {
                                                setErr(e?.message || "Password update failed.");
                                            } finally {
                                                setSavingPw(false);
                                            }
                                        }}
                                        style={{ ...confirmBtnStyle, ...(savingPw ? disabledBtnStyle : {}) }}
                                    >
                                        {savingPw ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                              <span style={spinnerStyle} />
                                              Saving...
                                            </span>
                                        ) : (
                                            "Confirm"
                                        )}
                                    </button>

                                    <button
                                        disabled={savingPw}
                                        onClick={() => {
                                            if (savingPw) return;
                                            setEditingPassword(false);
                                            setOldPw("");
                                            setNewPw("");
                                            setNewPw2("");
                                            setErr("");
                                            setPwMsg("");
                                        }}
                                        style={{ ...cancelBtnStyle, ...(savingPw ? disabledBtnStyle : {}) }}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {pwMsg && <div style={{ marginTop: 10, color: "lightgreen" }}>{pwMsg}</div>}
                            </div>
                        )}
                    </div>

                    {/* FITNESS STATS */}
                    <div style={{ marginTop: 28 }}>
                        <div style={labelStyle}>Fitness Stats</div>

                        {!editingStats ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
                                    <div>Age: {user.age ?? "—"}</div>
                                    <div>Height: {user.height ?? "—"}</div>
                                    <div>Weight: {user.weight ?? "—"}{user.weight != null ? " lbs" : ""}</div>
                                    <div>Experience: {user.experienceLevel ?? "—"}</div>
                                    <div>Workout Frequency: {user.workoutVolume ?? "—"}</div>
                                    <div>Equipment: {user.equipment ?? "—"}</div>
                                    <div>
                                        Goals: {user.goals?.length
                                        ? user.goals.map(id => goalLabelById.get(id) ?? id).join(", ")
                                        : "—"}
                                    </div>

                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setErr("");
                                            setEditingStats(true);

                                            setAgeDraft(user.age?.toString() ?? "");
                                            const h = user.height ?? "";
                                            const m = h.match(/^(\d+)'\s*(\d+)"$/);
                                            setFeetDraft(m ? m[1] : "");
                                            setInchesDraft(m ? m[2] : "");
                                            setWeightDraft(user.weight?.toString() ?? "");
                                            setExpDraft(user.experienceLevel ?? "");
                                            setVolDraft(user.workoutVolume ?? "");
                                            setEquipDraft(user.equipment ?? "");
                                            setGoalsDraft(user.goals ?? []);
                                        }}
                                        style={{
                                            ...editBtnStyle,
                                            width: "auto",
                                            padding: "6px 14px",
                                            fontSize: 14,
                                        }}
                                    >
                                        Edit
                                    </button>

                                    {statsSavedMsg && (
                                        <div style={{ color: "#4ade80", fontWeight: 700 }}>
                                            {statsSavedMsg}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (savingStats) return;
                                    setErr("");
                                    setStatsSavedMsg("");
                                    try {
                                        const age = ageDraft.trim() ? Number(ageDraft) : undefined;
                                        const weight = weightDraft.trim() ? Number(weightDraft) : undefined;
                                        const f = feetDraft.trim() ? Number(feetDraft) : undefined;
                                        const i = inchesDraft.trim() ? Number(inchesDraft) : undefined;

                                        if (age !== undefined && (!Number.isFinite(age) || age < 13 || age > 120)) {
                                            return setErr("Age must be between 13 and 120.");
                                        }
                                        if (weight !== undefined && (!Number.isFinite(weight) || weight < 50 || weight > 500)) {
                                            return setErr("Weight must be between 50 and 500.");
                                        }
                                        let height: string | undefined = undefined;
                                        if (f !== undefined || i !== undefined) {
                                            if (f === undefined || i === undefined) return setErr("Enter both feet and inches.");
                                            if (!Number.isFinite(f) || f < 1 || f > 8) return setErr("Feet must be between 1 and 8.");
                                            if (!Number.isFinite(i) || i < 0 || i > 11) return setErr("Inches must be between 0 and 11.");
                                            height = `${f}'${i}"`;
                                        }

                                        if (goalsDraft.length === 0) {
                                            return setErr("Pick at least one goal.");
                                        }

                                        setSavingStats(true);

                                        const updated = await updateUserStats(user.id, {
                                            age,
                                            height,
                                            weight,
                                            experienceLevel: expDraft || undefined,
                                            workoutVolume: volDraft || undefined,
                                            equipment: equipDraft || undefined,
                                            goals: goalsDraft,
                                        });

                                        onUserUpdate({ ...user, ...updated });
                                        setEditingStats(false);

                                        setStatsSavedMsg("Saved!");
                                        window.setTimeout(() => setStatsSavedMsg(""), 1600);
                                    } catch (e: any) {
                                        setErr(e?.message || "Update failed.");
                                    } finally {
                                        setSavingStats(false);
                                    }
                                }}
                                style={{ display: "flex", flexDirection: "column", gap: 10 }}
                            >
                                {/* Age */}
                                <input
                                    value={ageDraft}
                                    onChange={(e) => setAgeDraft(e.target.value)}
                                    placeholder="Age"
                                    style={activeInputStyle}
                                />

                                {/* Weight */}
                                <input
                                    value={weightDraft}
                                    onChange={(e) => setWeightDraft(e.target.value)}
                                    placeholder="Weight (lbs)"
                                    style={activeInputStyle}
                                />

                                {/* Height split: feet + inches */}
                                <div style={{ display: "flex", gap: 10 }}>
                                    <input
                                        value={feetDraft}
                                        onChange={(e) => setFeetDraft(e.target.value)}
                                        placeholder="Feet"
                                        inputMode="numeric"
                                        style={{ ...activeInputStyle, width: 155 }}
                                    />
                                    <input
                                        value={inchesDraft}
                                        onChange={(e) => setInchesDraft(e.target.value)}
                                        placeholder="Inches"
                                        inputMode="numeric"
                                        style={{ ...activeInputStyle, width: 155 }}
                                    />
                                </div>

                                {/* Experience dropdown */}
                                <select
                                    value={expDraft}
                                    onChange={(e) => setExpDraft(e.target.value)}
                                    style={activeInputStyle}
                                >
                                    {EXPERIENCE_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Workout frequency dropdown */}
                                <select
                                    value={volDraft}
                                    onChange={(e) => setVolDraft(e.target.value)}
                                    style={activeInputStyle}
                                >
                                    {WORKOUT_VOLUME_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Equipment dropdown */}
                                <select
                                    value={equipDraft}
                                    onChange={(e) => setEquipDraft(e.target.value)}
                                    style={activeInputStyle}
                                >
                                    {EQUIPMENT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {goalOptions.map((g) => {
                                        const active = goalsDraft.includes(g.id);
                                        return (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => toggleGoal(g.id)}
                                                style={{
                                                    padding: "8px 10px",
                                                    borderRadius: 999,
                                                    border: "1px solid rgba(255,255,255,0.18)",
                                                    background: active ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {active ? "✓ " : ""}{g.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                                    <button
                                        type="submit"
                                        disabled={savingStats}
                                        style={{ ...confirmBtnStyle, ...(savingStats ? disabledBtnStyle : {}) }}
                                    >
                                        {savingStats ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                              <span style={spinnerStyle} />
                                              Saving...
                                            </span>
                                        ) : (
                                            "Confirm"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (savingStats) return;
                                            setEditingStats(false);
                                            setErr("");
                                            setAgeDraft(user.age?.toString() ?? "");
                                            setWeightDraft(user.weight?.toString() ?? "");
                                            setExpDraft(user.experienceLevel ?? "");
                                            setVolDraft(user.workoutVolume ?? "");
                                            setEquipDraft(user.equipment ?? "");
                                            setGoalsDraft(user.goals ?? []);

                                            if (user.height) {
                                                const match = user.height.match(/^(\d+)'(\d{1,2})"$/);
                                                if (match) {
                                                    setFeetDraft(match[1]);
                                                    setInchesDraft(match[2]);
                                                } else {
                                                    setFeetDraft("");
                                                    setInchesDraft("");
                                                }
                                            } else {
                                                setFeetDraft("");
                                                setInchesDraft("");
                                            }
                                        }}
                                        style={cancelBtnStyle}
                                    >
                                        Cancel
                                    </button>
                                </div>

                            </form>
                        )}
                    </div>

                    {formattedCreatedAt && (
                        <div
                            style={{
                                marginTop: 40,
                                textAlign: "center",
                                opacity: 0.6,
                                fontSize: 14,
                            }}
                        >
                            Member since {formattedCreatedAt}
                        </div>
                    )}

                    {err && <div style={{ color: "salmon", marginTop: 16 }}>{err}</div>}
                </div>
            </div>
        </div>
    );
}
