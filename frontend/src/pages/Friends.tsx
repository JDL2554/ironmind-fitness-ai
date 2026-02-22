import React, { useState } from "react";
import "./Friends.css";
import type { User } from "../App";

type TabKey = "all" | "add";

type FriendsProps = {
    user: User;
};

export default function Friends({ user }: FriendsProps) {
    const [tab, setTab] = useState<TabKey>("all");

    // All friends search (UI only for now)
    const [friendQuery, setFriendQuery] = useState("");

    // Add friend inputs (UI only for now)
    const [codeInput, setCodeInput] = useState("");
    const [nameInput, setNameInput] = useState("");

    // Copy feedback
    const [copied, setCopied] = useState(false);

    const copyFriendCode = async () => {
        const raw = (user.friend_code || "").trim();
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
            // fallback
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            markCopied();
        }
    };

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
                                Manage friends, add by code, or search by name.
                            </div>
                        </div>
                    </div>

                    <div className="friends-me">
                        <div className="me-stack">
                            <div className="me-name">{user.name}</div>

                            <div className="me-code-row">
                                <span className="me-code">#{user.friend_code ?? "—"}</span>

                                <button
                                    type="button"
                                    onClick={copyFriendCode}
                                    title={copied ? "Copied!" : "Copy friend code"}
                                    className="copy-icon-btn"
                                    disabled={!user.friend_code}
                                    aria-label="Copy friend code"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                                    {/* UI only; you'll replace with real count */}
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
                                <div className="empty">
                                    <div className="empty-title">No friends yet</div>
                                    <div className="empty-sub">
                                        Go to <b>Add Friend</b> to send a request by code or search by name.
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="panel">
                            <div className="add-grid">
                                {/* By code */}
                                <div className="card">
                                    <div className="card-title">Add by friend code</div>
                                    <div className="card-sub">
                                        Enter a friend code exactly (example: <span className="mono">#JAC-1234</span>).
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
                                            onClick={() => {
                                                // TODO: call backend
                                                setCodeInput("");
                                            }}
                                        >
                                            Send
                                        </button>
                                    </div>

                                    <div className="card-foot muted">
                                        Tip: Friend codes are unique — you can copy yours above.
                                    </div>
                                </div>

                                {/* By name */}
                                <div className="card">
                                    <div className="card-title">Search by name</div>
                                    <div className="card-sub">
                                        Search users and send a request (server-side search later).
                                    </div>

                                    <div className="form-row">
                                        <input
                                            className="text-input"
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            placeholder="Type a name..."
                                            spellCheck={false}
                                        />
                                        <button
                                            className="ghost-btn"
                                            type="button"
                                            onClick={() => setNameInput("")}
                                            disabled={!nameInput.trim()}
                                        >
                                            Clear
                                        </button>
                                    </div>

                                    <div className="mini-list">
                                        {!nameInput.trim() ? (
                                            <div className="mini-empty muted">
                                                Start typing a name to search.
                                            </div>
                                        ) : (
                                            <div className="mini-empty muted">
                                                No results yet (hook up backend search).
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}