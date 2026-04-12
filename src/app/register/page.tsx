"use client";
import { useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function RegisterPage() {
    const [step, setStep] = useState<"details" | "otp">("details");
    const [form, setForm] = useState({ name: "", email: "", userType: "punter" });
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    function set(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    purpose: "register",
                    name: form.name,
                    userType: form.userType,
                }),
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
                body: JSON.stringify({ email: form.email, code: otp }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            // Both punters and subscribers need admin approval
            window.location.href = "/register/pending";
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ width: "100%", maxWidth: "44rem", backgroundColor: "#fff", borderRadius: "1.2rem", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ backgroundColor: "#0f0f0f", padding: "3.2rem 3.2rem 2.4rem", textAlign: "center" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", margin: "0 auto 1.6rem" }} /></a>
                    <h1 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Create Account</h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.6rem" }}>
                        {step === "details" ? "Choose your account type below" : "Enter the code sent to your email"}
                    </p>
                </div>

                {/* Form */}
                {step === "details" ? (
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

                        {/* User Type Selection */}
                        <div style={{ marginBottom: "2.4rem", padding: "1.6rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem", border: "1px solid #e8ebed" }}>
                            <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.2rem" }}>Account Type:</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <label style={{ cursor: "pointer", padding: "1.2rem", backgroundColor: form.userType === "punter" ? "#fff" : "transparent", border: `2px solid ${form.userType === "punter" ? "#ff6b00" : "#e8ebed"}`, borderRadius: "0.6rem", transition: "all 0.2s" }}>
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="punter"
                                        checked={form.userType === "punter"}
                                        onChange={e => set("userType", e.target.value)}
                                        style={{ marginRight: "0.8rem" }}
                                    />
                                    <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a" }}>
                                        <strong>Punter / Tipster</strong> - Post predictions & blog content <span style={{ color: "#16a34a", fontWeight: 700 }}>(FREE)</span>
                                    </span>
                                </label>
                                <label style={{ cursor: "pointer", padding: "1.2rem", backgroundColor: form.userType === "subscriber" ? "#fff" : "transparent", border: `2px solid ${form.userType === "subscriber" ? "#ff6b00" : "#e8ebed"}`, borderRadius: "0.6rem", transition: "all 0.2s" }}>
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="subscriber"
                                        checked={form.userType === "subscriber"}
                                        onChange={e => set("userType", e.target.value)}
                                        style={{ marginRight: "0.8rem" }}
                                    />
                                    <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a" }}>
                                        <strong>Subscriber</strong> - View expert predictions <span style={{ color: "#ff6b00", fontWeight: 700 }}>(PAID)</span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.8rem" }}>
                            <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => set("name", e.target.value)}
                                placeholder="Your full name"
                                required
                                style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", backgroundColor: "#fafafa" }}
                                onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                        </div>

                        <div style={{ marginBottom: "2.4rem" }}>
                            <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => set("email", e.target.value)}
                                placeholder="you@example.com"
                                required
                                style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", backgroundColor: "#fafafa" }}
                                onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{ width: "100%", padding: "1.3rem", backgroundColor: loading ? "#ccc" : "#ff6b00", border: "none", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {loading ? "Sending Code…" : "Send Verification Code"}
                        </button>

                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", marginTop: "2rem" }}>
                            Already have an account?{" "}
                            <a href="/login" style={{ color: "#ff6b00", fontWeight: 700 }}>Sign in</a>
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
                            Code sent to <strong>{form.email}</strong>
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
                            {loading ? "Creating Account…" : "Verify & Create Account"}
                        </button>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep("details");
                                    setOtp("");
                                    setError("");
                                }}
                                style={{ background: "none", border: "none", fontFamily: f, fontSize: "1.2rem", color: "#68676d", cursor: "pointer", textDecoration: "underline" }}
                            >
                                ← Change Details
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
