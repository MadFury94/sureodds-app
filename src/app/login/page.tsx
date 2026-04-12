"use client";
import { useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function LoginPage() {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, purpose: "login" }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            setSuccess("OTP sent! Check your email.");

            // In development, show OTP in console for testing
            if (data.code) {
                console.log("🔐 Development OTP Code:", data.code);
                alert(`Development Mode: Your OTP is ${data.code}`);
            }

            setStep("otp");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: otp }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

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
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.6rem" }}>
                        {step === "email" ? "Enter your email to receive a login code" : "Enter the code sent to your email"}
                    </p>
                </div>

                {step === "email" ? (
                    <form onSubmit={handleSendOTP} style={{ padding: "3.2rem" }}>
                        {error && (
                            <div style={{ padding: "1.2rem 1.4rem", backgroundColor: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#dc2626", marginBottom: "2rem" }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: "1.2rem 1.4rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#16a34a", marginBottom: "2rem" }}>
                                {success}
                            </div>
                        )}

                        <div style={{ marginBottom: "2.4rem" }}>
                            <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", backgroundColor: "#fafafa" }}
                                onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{ width: "100%", padding: "1.3rem", backgroundColor: loading ? "#ccc" : "#ff6b00", border: "none", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {loading ? "Sending Code…" : "Send Login Code"}
                        </button>

                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", marginTop: "2rem" }}>
                            Don&apos;t have an account?{" "}
                            <a href="/register" style={{ color: "#ff6b00", fontWeight: 700 }}>Sign up free</a>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} style={{ padding: "3.2rem" }}>
                        {error && (
                            <div style={{ padding: "1.2rem 1.4rem", backgroundColor: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#dc2626", marginBottom: "2rem" }}>
                                {error}
                            </div>
                        )}

                        <div style={{ padding: "1.2rem 1.4rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.2rem", color: "#16a34a", marginBottom: "2rem", textAlign: "center" }}>
                            Code sent to <strong>{email}</strong>
                        </div>

                        <div style={{ marginBottom: "2.4rem" }}>
                            <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>Enter 6-Digit Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                required
                                maxLength={6}
                                style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: "monospace", fontSize: "2rem", color: "#1a1a1a", outline: "none", backgroundColor: "#fafafa", textAlign: "center", letterSpacing: "0.5rem" }}
                                onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                        </div>

                        <button type="submit" disabled={loading || otp.length !== 6} style={{ width: "100%", padding: "1.3rem", backgroundColor: (loading || otp.length !== 6) ? "#ccc" : "#ff6b00", border: "none", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: "#fff", cursor: (loading || otp.length !== 6) ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {loading ? "Verifying…" : "Verify & Sign In"}
                        </button>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep("email");
                                    setOtp("");
                                    setError("");
                                }}
                                style={{ background: "none", border: "none", fontFamily: f, fontSize: "1.2rem", color: "#68676d", cursor: "pointer", textDecoration: "underline" }}
                            >
                                ← Change Email
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    handleSendOTP(new Event("submit") as any);
                                }}
                                disabled={loading}
                                style={{ background: "none", border: "none", fontFamily: f, fontSize: "1.2rem", color: "#ff6b00", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700 }}
                            >
                                Resend Code
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
