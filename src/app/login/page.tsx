"use client";
import { useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }

            const user = data.user;

            // Check if account is pending approval
            if (user.status === "pending") {
                window.location.href = "/register/pending";
                return;
            }

            // Check if account is suspended
            if (user.status === "suspended") {
                setError("Your account has been suspended. Please contact support.");
                return;
            }

            // Punters go to punter dashboard
            if (user.role === "punter") {
                window.location.href = "/dashboard/punter";
                return;
            }

            // Tips-admin goes to tips section
            if (user.role === "tips-admin") {
                window.location.href = "/admin-dashboard/tips";
                return;
            }

            // Subscribers: check if they need to pay
            if (user.role === "subscriber" && user.status !== "active") {
                window.location.href = "/subscribe";
                return;
            }

            // Active subscribers go to dashboard
            window.location.href = "/dashboard";
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ width: "100%", maxWidth: "44rem", backgroundColor: "#fff", borderRadius: "1.2rem", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ backgroundColor: "#0f0f0f", padding: "3.2rem 3.2rem 2.4rem", textAlign: "center" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", margin: "0 auto 1.6rem" }} /></a>
                    <h1 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Sign In</h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.6rem" }}>Access your betting tips dashboard</p>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "3.2rem" }}>
                    {error && (
                        <div style={{ padding: "1.2rem 1.4rem", backgroundColor: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#dc2626", marginBottom: "2rem" }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: "1.8rem" }}>
                        <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>Email Address</label>
                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" required
                            style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", backgroundColor: "#fafafa" }}
                            onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                            onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                        />
                    </div>

                    <div style={{ marginBottom: "2.4rem" }}>
                        <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>Password</label>
                        <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Your password" required
                            style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", backgroundColor: "#fafafa" }}
                            onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                            onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{ width: "100%", padding: "1.3rem", backgroundColor: loading ? "#ccc" : "#ff6b00", border: "none", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {loading ? "Signing in…" : "Sign In"}
                    </button>

                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", marginTop: "2rem" }}>
                        Don&apos;t have an account?{" "}
                        <a href="/register" style={{ color: "#ff6b00", fontWeight: 700 }}>Sign up free</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
