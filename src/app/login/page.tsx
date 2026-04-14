"use client";
import { useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

type Step = "email" | "otp";

export default function LoginPage() {
    const [currentStep, setCurrentStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const steps: Step[] = ["email", "otp"];
    const stepIndex = steps.indexOf(currentStep);
    const progress = ((stepIndex + 1) / steps.length) * 100;

    async function sendOTP() {
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

            if (data.code) {
                console.log("🔐 Development OTP Code:", data.code);
                setSuccess(`✅ OTP sent! Your code is: ${data.code}`);
            } else {
                setSuccess("OTP sent! Check your email.");
            }

            setCurrentStep("otp");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleNext() {
        if (currentStep === "email") {
            if (!email.trim()) {
                setError("Please enter your email");
                return;
            }
            await sendOTP();
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

            if (user.status === "pending") {
                window.location.href = "/register/pending";
                return;
            }

            if (user.status === "suspended") {
                setError("Your account has been suspended. Please contact support.");
                return;
            }

            if (user.role === "punter") {
                window.location.href = "/dashboard/punter";
                return;
            }

            if (user.role === "tips-admin") {
                window.location.href = "/admin-dashboard/tips";
                return;
            }

            if (user.role === "subscriber" && user.status !== "active") {
                window.location.href = "/subscribe";
                return;
            }

            window.location.href = "/dashboard";
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function goBack() {
        setCurrentStep("email");
        setOtp("");
        setError("");
        setSuccess("");
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ width: "100%", maxWidth: "50rem", backgroundColor: "#fff", borderRadius: "1.2rem", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ backgroundColor: "#0f0f0f", padding: "3.2rem 3.2rem 2.4rem", textAlign: "center" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", margin: "0 auto 1.6rem" }} /></a>
                    <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Sign In</h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.6rem" }}>
                        Step {stepIndex + 1} of {steps.length}
                    </p>
                </div>

                {/* Progress Bar */}
                <div style={{ height: "0.4rem", backgroundColor: "#e8ebed" }}>
                    <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#ff6b00", transition: "width 0.3s" }} />
                </div>

                {/* Content */}
                <div style={{ padding: "3.2rem" }}>
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

                    {/* Step: Email */}
                    {currentStep === "email" && (
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>Welcome back!</h2>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "2.4rem" }}>
                                Enter your email to receive a login code
                            </p>

                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: "1.4rem 1.6rem",
                                    border: "2px solid #e8ebed",
                                    borderRadius: "0.8rem",
                                    fontFamily: f,
                                    fontSize: "1.6rem",
                                    color: "#1a1a1a",
                                    outline: "none",
                                    marginBottom: "2.4rem",
                                }}
                                onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                                onKeyPress={e => e.key === "Enter" && handleNext()}
                            />

                            <button
                                onClick={handleNext}
                                disabled={!email.trim() || loading}
                                style={{
                                    width: "100%",
                                    padding: "1.4rem",
                                    backgroundColor: email.trim() && !loading ? "#ff6b00" : "#ccc",
                                    border: "none",
                                    borderRadius: "0.6rem",
                                    fontFamily: fd,
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: email.trim() && !loading ? "pointer" : "not-allowed",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {loading ? "Sending..." : "Send Login Code"}
                            </button>

                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", marginTop: "2.4rem" }}>
                                Don't have an account?{" "}
                                <a href="/register" style={{ color: "#ff6b00", fontWeight: 700, textDecoration: "none" }}>Sign up free</a>
                            </p>
                        </div>
                    )}

                    {/* Step: OTP */}
                    {currentStep === "otp" && (
                        <form onSubmit={handleVerifyOTP}>
                            <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>Enter Verification Code</h2>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "2.4rem" }}>
                                We sent a 6-digit code to <strong>{email}</strong>
                            </p>

                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: "1.4rem",
                                    border: "2px solid #e8ebed",
                                    borderRadius: "0.8rem",
                                    fontFamily: "monospace",
                                    fontSize: "2.4rem",
                                    color: "#1a1a1a",
                                    textAlign: "center",
                                    letterSpacing: "1rem",
                                    outline: "none",
                                    marginBottom: "2.4rem",
                                }}
                                onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />

                            <div style={{ display: "flex", gap: "1.2rem" }}>
                                <button
                                    type="button"
                                    onClick={goBack}
                                    style={{
                                        flex: 1,
                                        padding: "1.4rem",
                                        backgroundColor: "#f9fafb",
                                        border: "2px solid #e8ebed",
                                        borderRadius: "0.6rem",
                                        fontFamily: fd,
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "#68676d",
                                        cursor: "pointer",
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={otp.length !== 6 || loading}
                                    style={{
                                        flex: 2,
                                        padding: "1.4rem",
                                        backgroundColor: otp.length === 6 && !loading ? "#ff6b00" : "#ccc",
                                        border: "none",
                                        borderRadius: "0.6rem",
                                        fontFamily: fd,
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: otp.length === 6 && !loading ? "pointer" : "not-allowed",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {loading ? "Verifying..." : "Verify & Sign In"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => sendOTP()}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    marginTop: "1.2rem",
                                    padding: "1rem",
                                    background: "none",
                                    border: "none",
                                    fontFamily: f,
                                    fontSize: "1.3rem",
                                    color: "#ff6b00",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Resend Code
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", marginTop: "3.2rem" }}>
                        Need help?{" "}
                        <a href="/contact" style={{ color: "#ff6b00", fontWeight: 700, textDecoration: "none" }}>Contact support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
