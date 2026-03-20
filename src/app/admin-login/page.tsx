"use client";
import { useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Please fill in all fields."); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/wordpress-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Login failed. Please try again.");
            } else {
                // Redirect to admin dashboard on success
                window.location.href = "/admin-dashboard";
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: "100vh", display: "flex",
            fontFamily: f,
        }}>
            {/* ── Left: image panel ── */}
            <div style={{
                flex: "1 1 55%", position: "relative",
                display: "flex", flexDirection: "column",
                justifyContent: "flex-end",
                overflow: "hidden",
            }} className="admin-login-image-panel">
                {/* Background image */}
                <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=85"
                    alt=""
                    style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%", objectFit: "cover",
                    }}
                />
                {/* Dark overlay */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)",
                }} />

                {/* Content over image */}
                <div style={{ position: "relative", zIndex: 1, padding: "4rem" }}>
                    {/* Logo */}
                    <a href="/" style={{ display: "inline-block", marginBottom: "4rem" }}>
                        <img src="/logo.png" alt="Sureodds" style={{ height: "4rem", width: "auto" }} />
                    </a>

                    {/* Quote */}
                    <blockquote style={{ margin: 0 }}>
                        <p style={{
                            fontFamily: fd, fontWeight: 700,
                            fontSize: "clamp(2.4rem, 3.5vw, 4rem)",
                            color: "#fff", lineHeight: 1.15,
                            textTransform: "uppercase", letterSpacing: "0.02em",
                            marginBottom: "1.6rem",
                        }}>
                            The home of<br />
                            <span style={{ color: "#ff6b00" }}>sure odds.</span>
                        </p>
                        <p style={{
                            fontFamily: f, fontSize: "1.5rem",
                            color: "rgba(255,255,255,0.6)", lineHeight: 1.6,
                            maxWidth: "42rem",
                        }}>
                            Manage tips, articles, and team content from one place.
                        </p>
                    </blockquote>

                    {/* Stats row */}
                    <div style={{
                        display: "flex", gap: "3.2rem", marginTop: "3.2rem",
                        paddingTop: "3.2rem", borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}>
                        {[
                            { value: "Daily", label: "Tips Updated" },
                            { value: "Live", label: "Scores" },
                            { value: "Expert", label: "Analysis" },
                        ].map(s => (
                            <div key={s.label}>
                                <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#fff", margin: 0 }}>{s.value}</p>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "rgba(255,255,255,0.5)", margin: "0.2rem 0 0" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: form panel ── */}
            <div style={{
                flex: "0 0 45%", minWidth: "36rem",
                backgroundColor: "#fff",
                display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center",
                padding: "4rem 5rem",
            }} className="admin-login-form-panel">
                <div style={{ width: "100%", maxWidth: "40rem" }}>

                    {/* Mobile logo (hidden on desktop) */}
                    <a href="/" style={{ display: "none" }} className="admin-login-mobile-logo">
                        <img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", width: "auto", marginBottom: "3.2rem" }} />
                    </a>

                    {/* Heading */}
                    <div style={{ marginBottom: "3.6rem" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "0.6rem",
                            backgroundColor: "#fff5f7", border: "1px solid #fecdd3",
                            borderRadius: "10rem", padding: "0.4rem 1.2rem",
                            marginBottom: "1.6rem",
                        }}>
                            <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", backgroundColor: "#ff6b00", display: "inline-block" }} />
                            <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#ff6b00", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Admin Portal
                            </span>
                        </div>
                        <h1 style={{
                            fontFamily: fd, fontWeight: 700,
                            fontSize: "3.2rem", color: "#1a1a1a",
                            textTransform: "uppercase", letterSpacing: "0.02em",
                            lineHeight: 1.1, margin: 0,
                        }}>
                            Welcome back
                        </h1>
                        <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", marginTop: "0.8rem" }}>
                            Sign in to manage your content
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                        {/* Email */}
                        <div>
                            <label style={{
                                display: "block", fontFamily: f, fontSize: "1.3rem",
                                fontWeight: 700, color: "#1a1a1a", marginBottom: "0.7rem",
                            }}>
                                Username or Email
                            </label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: "1.4rem", top: "50%",
                                    transform: "translateY(-50%)", pointerEvents: "none",
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99989f" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="username or email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: "100%", padding: "1.3rem 1.4rem 1.3rem 4rem",
                                        border: "1.5px solid #e8ebed", borderRadius: "0.8rem",
                                        fontFamily: f, fontSize: "1.5rem", color: "#1a1a1a",
                                        backgroundColor: "#fafafa", outline: "none",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.15s, box-shadow 0.15s",
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "#1a1a1a"; e.target.style.boxShadow = "0 0 0 3px rgba(26,26,26,0.08)"; e.target.style.backgroundColor = "#fff"; }}
                                    onBlur={e => { e.target.style.borderColor = "#e8ebed"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#fafafa"; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.7rem" }}>
                                <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a" }}>
                                    Password
                                </label>
                                <a href="#" style={{ fontFamily: f, fontSize: "1.2rem", color: "#ff6b00", textDecoration: "none", fontWeight: 600 }}>
                                    Forgot password?
                                </a>
                            </div>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: "1.4rem", top: "50%",
                                    transform: "translateY(-50%)", pointerEvents: "none",
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99989f" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: "100%", padding: "1.3rem 4rem 1.3rem 4rem",
                                        border: "1.5px solid #e8ebed", borderRadius: "0.8rem",
                                        fontFamily: f, fontSize: "1.5rem", color: "#1a1a1a",
                                        backgroundColor: "#fafafa", outline: "none",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.15s, box-shadow 0.15s",
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "#1a1a1a"; e.target.style.boxShadow = "0 0 0 3px rgba(26,26,26,0.08)"; e.target.style.backgroundColor = "#fff"; }}
                                    onBlur={e => { e.target.style.borderColor = "#e8ebed"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#fafafa"; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    style={{
                                        position: "absolute", right: "1.4rem", top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer",
                                        padding: "0.2rem", color: "#99989f",
                                    }}
                                    aria-label={showPass ? "Hide password" : "Show password"}
                                >
                                    {showPass
                                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: "0.8rem",
                                padding: "1.2rem 1.4rem", borderRadius: "0.8rem",
                                backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#ff6b00", fontWeight: 600 }}>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "1.5rem",
                                backgroundColor: loading ? "#68676d" : "#1a1a1a",
                                color: "#fff", border: "none", borderRadius: "0.8rem",
                                fontFamily: fd, fontSize: "1.5rem", fontWeight: 700,
                                letterSpacing: "0.04em", textTransform: "uppercase",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "background-color 0.2s, transform 0.1s",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem",
                            }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ff6b00"; }}
                            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a1a"; }}
                        >
                            {loading ? (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : "Sign In →"}
                        </button>

                    </form>

                    {/* Back to site */}
                    <div style={{ marginTop: "3.2rem", paddingTop: "2.4rem", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
                        <a href="/" style={{
                            display: "inline-flex", alignItems: "center", gap: "0.6rem",
                            fontFamily: f, fontSize: "1.4rem", fontWeight: 600,
                            color: "#68676d", textDecoration: "none",
                            transition: "color 0.15s",
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#1a1a1a")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#68676d")}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back to Sureodds
                        </a>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .admin-login-image-panel { display: none !important; }
                    .admin-login-form-panel  { flex: 1 1 100% !important; min-width: unset !important; padding: 3.2rem 2.4rem !important; }
                    .admin-login-mobile-logo { display: block !important; }
                }
            `}</style>
        </div>
    );
}
