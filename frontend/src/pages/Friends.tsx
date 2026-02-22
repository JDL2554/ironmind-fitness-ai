import React, { useState, useEffect } from "react";
import "./Friends.css";
import type { User } from "../App";
import { sendFriendRequestByCode, declineFriendRequest, getIncomingFriendRequests, acceptFriendRequest,
    getFriendsList, type PendingRequest, type FriendListItem, removeFriend } from "../services/Friends";

type TabKey = "all" | "add";

type FriendsProps = {
    user: User;
};

const backendOrigin = "http://localhost:8000";

function buildPhotoUrl(url?: string | null) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${backendOrigin}${url}`;
}

function buildInitials(name?: string | null) {
    if (!name) return "?";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");
}

export default function Friends({ user }: FriendsProps) {
    const [tab, setTab] = useState<TabKey>("all");

    // All friends search (UI only for now)
    const [friendQuery, setFriendQuery] = useState("");

    // Add friend by code
    const [codeInput, setCodeInput] = useState("");

    // Copy feedback
    const [copied, setCopied] = useState(false);

    // Messages
    const [codeMsg, setCodeMsg] = useState<string>("");
    const [codeErr, setCodeErr] = useState<string>("");

    const [pending, setPending] = useState<PendingRequest[]>([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [pendingErr, setPendingErr] = useState("");

    const [pendingQuery, setPendingQuery] = useState("");

    const [friends, setFriends] = useState<FriendListItem[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsErr, setFriendsErr] = useState("");

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<FriendListItem | null>(null);
    const [removeErr, setRemoveErr] = useState("");

    const filteredPending = pending.filter((p) => {
        const q = pendingQuery.trim().toLowerCase();
        if (!q) return true;
        return (
            (p.name || "").toLowerCase().includes(q) ||
            (p.friend_code || "").toLowerCase().includes(q)
        );
    });

    // friend code display (handles snake_case vs camelCase just in case)
    const myCode =
        (user as any).friend_code ?? (user as any).friendCode ?? null;

    useEffect(() => {
        if (tab !== "all") return;

        let alive = true;
        setFriendsErr("");
        setFriendsLoading(true);

        getFriendsList(user.id)
            .then((rows) => {
                if (!alive) return;
                setFriends(rows);
            })
            .catch((e: any) => {
                if (!alive) return;
                setFriendsErr(e?.message || "Failed to load friends.");
                setFriends([]);
            })
            .finally(() => {
                if (!alive) return;
                setFriendsLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [tab, user.id]);

    useEffect(() => {
        if (tab !== "add") return;

        let alive = true;
        setPendingErr("");
        setPendingLoading(true);

        getIncomingFriendRequests(user.id)
            .then((rows) => {
                if (!alive) return;
                setPending(rows);
            })
            .catch((e: any) => {
                if (!alive) return;
                setPendingErr(e?.message || "Failed to load pending requests.");
                setPending([]);
            })
            .finally(() => {
                if (!alive) return;
                setPendingLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [tab, user.id]);

    const copyFriendCode = async () => {
        const raw = (myCode || "").trim();
        if (!raw) return;

        const text = `#${raw}`;

        const markCopied = () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        };

        try {
            await navigator.clipboard.writeText(text);
            markCopied();
        } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            markCopied();
        }
    };

    const sendByCode = async () => {
        setCodeErr("");
        setCodeMsg("");

        try {
            await sendFriendRequestByCode(user.id, {friend_code: codeInput});
            setCodeMsg("Friend request sent!");
            setCodeInput("");
        } catch (e: any) {
            setCodeErr(e?.message || "Failed to send request.");
        }
    };

    const filteredFriends = friends.filter((f) => {
        const q = friendQuery.trim().toLowerCase();
        if (!q) return true;
        return (
            f.name.toLowerCase().includes(q) ||
            f.friend_code.toLowerCase().includes(q)
        );
    });

    return (
        <div className="friends-page">
            <div className="friends-shell">
                {/* Header */}
                <div className="friends-header">
                    <div className="friends-title">
                        <div className="friends-badge">👥</div>
                        <div>
                            <div className="friends-h1">Friends</div>
                            <div className="friends-sub">
                                Manage friends and add by friend code.
                            </div>
                        </div>
                    </div>

                    <div className="friends-me">
                        <div className="me-stack">
                            <div className="me-name">{user.name}</div>

                            <div className="me-code-row">
                                <span className="me-code">#{myCode ?? "—"}</span>

                                <button
                                    type="button"
                                    onClick={copyFriendCode}
                                    title={copied ? "Copied!" : "Copy friend code"}
                                    className="copy-icon-btn"
                                    disabled={!myCode}
                                    aria-label="Copy friend code"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
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

                                {copied && <span className="copied-pill">Copied!</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="friends-tabs">
                    <button
                        className={`tab-btn ${tab === "all" ? "tab-btn--active" : ""}`}
                        onClick={() => setTab("all")}
                        type="button"
                    >
                        All Friends
                    </button>
                    <button
                        className={`tab-btn ${tab === "add" ? "tab-btn--active" : ""}`}
                        onClick={() => setTab("add")}
                        type="button"
                    >
                        Add Friend
                    </button>
                </div>

                {/* Content */}
                <div className="friends-content">
                    {tab === "all" ? (
                        <section className="panel">
                            <div className="panel-top">
                                <div className="search-wrap">
                                    <input
                                        className="search-input"
                                        value={friendQuery}
                                        onChange={(e) => setFriendQuery(e.target.value)}
                                        placeholder="Search friends by name or code..."
                                        spellCheck={false}
                                    />
                                    {/* UI only; wire up later */}
                                    <div className="search-hint">0 found</div>
                                </div>

                                <button
                                    className="ghost-btn"
                                    type="button"
                                    onClick={() => setFriendQuery("")}
                                    disabled={!friendQuery.trim()}
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="list">
                                {friendsErr && <div className="form-error">{friendsErr}</div>}

                                {friendsLoading ? (
                                    <div className="mini-empty muted">Loading friends…</div>
                                ) : filteredFriends.length === 0 ? (
                                    <div className="empty">
                                        <div className="empty-title">No friends yet</div>
                                        <div className="empty-sub">
                                            Go to <b>Add Friend</b> to send a request by code.
                                        </div>
                                    </div>
                                ) : (
                                    filteredFriends.map((f) => {
                                        const photoUrl = buildPhotoUrl(f.profile_image_url);
                                        const initials = buildInitials(f.name);

                                        return (
                                            <div className="row" key={f.id}>
                                                <div className="row-left">
                                                    <div className="avatar avatar--sm">
                                                        {photoUrl ? (
                                                            <img
                                                                src={photoUrl}
                                                                alt={f.name}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    borderRadius: "999px",
                                                                    objectFit: "cover",
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{initials}</span>
                                                        )}
                                                    </div>

                                                    <div className="row-meta">
                                                        <div className="row-name">{f.name}</div>
                                                        <div className="row-sub">
                                                            <span className="mono">#{f.friend_code}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row-actions">
                                                    <button
                                                        className="ghost-btn"
                                                        type="button"
                                                        onClick={() => alert("(stub) view friend")}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="danger-btn"
                                                        type="button"
                                                        onClick={() => {
                                                            setRemoveErr("");
                                                            setRemoveTarget(f);
                                                            setShowRemoveModal(true);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    ) : (
                        <>
                            <section className="panel">
                                <div className="add-grid">
                                    <div className="card">
                                        <div className="card-title">Add by friend code</div>
                                        <div className="card-sub">
                                            Enter a friend code exactly (example:{" "}
                                            <span className="mono">#JAC-1234</span>).
                                        </div>

                                        <div className="form-row">
                                            <input
                                                className="text-input"
                                                value={codeInput}
                                                onChange={(e) => setCodeInput(e.target.value)}
                                                placeholder="Friend code"
                                                spellCheck={false}
                                            />
                                            <button
                                                className="primary-btn"
                                                type="button"
                                                disabled={!codeInput.trim()}
                                                onClick={sendByCode}
                                            >
                                                Send
                                            </button>
                                        </div>

                                        {codeErr && (
                                            <div className="form-error" style={{ marginTop: 6 }}>
                                                {codeErr}
                                            </div>
                                        )}
                                        {codeMsg && (
                                            <div className="form-ok" style={{ marginTop: 6 }}>
                                                {codeMsg}
                                            </div>
                                        )}

                                        <div className="card-foot muted">
                                            Tip: Friend codes are unique — you can copy yours above.
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ============================= */}
                            {/* PANEL 2 — PENDING REQUESTS  */}
                            {/* ============================= */}
                            <section className="panel panel--light">
                                <div className="panel-light-inner">
                                    <div className="panel-light-title">Pending friend requests</div>
                                    <div className="panel-light-sub">
                                        Requests other users have sent to you.
                                    </div>
                                    <div className="panel-light-search">
                                        <input
                                            className="text-input"
                                            value={pendingQuery}
                                            onChange={(e) => setPendingQuery(e.target.value)}
                                            placeholder="Search pending requests…"
                                            spellCheck={false}
                                        />
                                        <button
                                            className="ghost-btn"
                                            type="button"
                                            onClick={() => setPendingQuery("")}
                                            disabled={!pendingQuery.trim()}
                                        >
                                            Clear
                                        </button>
                                    </div>

                                    <div className="panel-light-count muted">
                                        {filteredPending.length} request{filteredPending.length === 1 ? "" : "s"}
                                    </div>

                                    {pendingErr && (
                                        <div className="form-error" style={{ marginTop: 10 }}>
                                            {pendingErr}
                                        </div>
                                    )}

                                    {pendingLoading ? (
                                        <div className="mini-empty muted" style={{ marginTop: 16 }}>
                                            Loading…
                                        </div>
                                    ) : pending.length === 0 ? (
                                        <div className="mini-empty muted" style={{ marginTop: 16 }}>
                                            No pending requests.
                                        </div>
                                    ) : (
                                        <div className="mini-list" style={{ marginTop: 16 }}>
                                            {pending.map((p) => (
                                                <div className="mini-row" key={p.id}>
                                                    <div className="mini-left">
                                                        <div className="mini-meta">
                                                            <div className="row-name">{p.name}</div>
                                                            <div className="row-sub">
                                                                <span className="mono">#{p.friend_code}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", gap: 10 }}>
                                                        <button
                                                            className="primary-btn"
                                                            type="button"
                                                            onClick={async () => {
                                                                setPendingErr("");
                                                                try {
                                                                    await acceptFriendRequest(user.id, p.id);
                                                                    setPending((prev) =>
                                                                        prev.filter((x) => x.id !== p.id)
                                                                    );
                                                                } catch (e: any) {
                                                                    setPendingErr(
                                                                        e?.message || "Failed to accept request."
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            className="ghost-btn"
                                                            type="button"
                                                            onClick={async () => {
                                                                setPendingErr("");
                                                                try {
                                                                    await declineFriendRequest(user.id, p.id);
                                                                    setPending((prev) =>
                                                                        prev.filter((x) => x.id !== p.id)
                                                                    );
                                                                } catch (e: any) {
                                                                    setPendingErr(
                                                                        e?.message || "Failed to decline request."
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
            {showRemoveModal && removeTarget && (
                <div
                    onClick={() => !removing && setShowRemoveModal(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        display: "grid",
                        placeItems: "center",
                        zIndex: 9999,
                        padding: 16,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "min(520px, 100%)",
                            borderRadius: 18,
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(20,22,28,0.92)",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
                            padding: 18,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 12,
                                        display: "grid",
                                        placeItems: "center",
                                        background: "rgba(239,68,68,0.18)",
                                        border: "1px solid rgba(239,68,68,0.35)",
                                        fontSize: 18,
                                    }}
                                >
                                    ⚠️
                                </div>

                                <div>
                                    <div style={{ fontWeight: 900, fontSize: 16 }}>
                                        Remove friend?
                                    </div>
                                    <div style={{ opacity: 0.75, fontSize: 13, marginTop: 2 }}>
                                        This will remove <b>{removeTarget.name}</b> from your friends list.
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => !removing && setShowRemoveModal(false)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "rgba(255,255,255,0.75)",
                                    cursor: removing ? "not-allowed" : "pointer",
                                    fontSize: 18,
                                    padding: 6,
                                }}
                                aria-label="Close"
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div
                            style={{
                                marginTop: 14,
                                padding: "12px 12px",
                                borderRadius: 14,
                                background: "rgba(255,255,255,0.05)",
                            }}
                        >
                            <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
                                You can always add them again later using their friend code.
                            </div>
                        </div>

                        {removeErr && (
                            <div style={{ marginTop: 12, color: "salmon", fontWeight: 700 }}>
                                {removeErr}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                            <button
                                type="button"
                                disabled={removing}
                                onClick={() => setShowRemoveModal(false)}
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: 12,
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    background: "transparent",
                                    color: "white",
                                    fontWeight: 700,
                                    cursor: removing ? "not-allowed" : "pointer",
                                    opacity: removing ? 0.65 : 1,
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={removing}
                                onClick={async () => {
                                    if (removing) return;
                                    setRemoveErr("");

                                    setRemoving(true);
                                    try {
                                        await removeFriend(user.id, removeTarget.id);

                                        setFriends((prev) => prev.filter((x) => x.id !== removeTarget.id));

                                        setShowRemoveModal(false);
                                        setRemoveTarget(null);
                                    } catch (e: any) {
                                        setRemoveErr(e?.message || "Failed to remove friend.");
                                    } finally {
                                        setRemoving(false);
                                    }
                                }}
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: 12,
                                    border: "1px solid rgba(239,68,68,0.45)",
                                    background: "rgba(239,68,68,0.20)",
                                    color: "white",
                                    fontWeight: 900,
                                    cursor: removing ? "not-allowed" : "pointer",
                                    opacity: removing ? 0.7 : 1,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                {removing ? (
                                    <>
              <span
                  style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.35)",
                      borderTopColor: "white",
                      animation: "spin 0.9s linear infinite",
                  }}
              />
                                        Removing…
                                    </>
                                ) : (
                                    "Yes, remove"
                                )}
                            </button>
                        </div>

                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                </div>
            )}
        </div>
    );
}