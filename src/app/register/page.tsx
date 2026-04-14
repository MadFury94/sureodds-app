"use client";
import { useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

type Step = "type" | "name" | "email" | "payment" | "otp";

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState<Step>("type");
    const [userType, setUserType] = useState<"punter" | "subscriber">("punter");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState<"online" | "manual">("online");
    const [paymentRef, setPaymentRef] = useState("");
    const [proofImage, setProofImage] = useState<File | null>(null);

    const steps: Step[] = userType === "punter"
        ? ["type", "name", "email", "otp"]
        : ["type", "name", "email", "payment", "otp"];

    const stepIndex = steps.indexOf(currentStep);
    const progress = ((stepIndex + 1) / steps.length) * 100;

    async function handleNext() {
        setError("");
        setSuccess("");

        if (currentStep === "type") {
            setCurrentStep("name");
        } else if (currentStep === "name") {
            if (!name.trim()) {
                setError("Please enter your name");
                return;
            }
            setCurrentStep("email");
        } else if (currentStep === "email") {
            if (!email.trim()) {
                setError("Please enter your email");
                return;
            }

            // For subscribers, go to payment first
            if (userType === "subscriber") {
                setCurrentStep("payment");
            } else {
                // For punters, send OTP directly
                await sendOTP();
            }
        } else if (currentStep === "payment") {
            // Handle payment submission
            await handlePayment();
        }
    }

    async function sendOTP() {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    purpose: "register",
                    name,
                    userType,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            if (data.code) {
                setSuccess(`✅ OTP sent! Your code is: ${data.code}`);
            } else {
                setSuccess("OTP sent! Check your email.");
            }

            setCurrentStep("otp");
        } catch {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handlePayment() {
        if (paymentMethod === "online") {
            // For now, show message that payment will be required after registration
            setSuccess("You'll be redirected to payment after account creation");
            await sendOTP();
        } else {
            // Manual payment - just store the reference for now
            if (!paymentRef.trim()) {
                setError("Please enter payment reference");
                return;
            }
            // Store payment info in state and proceed to OTP
            setSuccess("Payment details saved. Complete registration to submit.");
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

            if (data.isNewUser) {
                if (userType === "subscriber") {
                    window.location.href = "/subscribe";
                } else {
                    window.location.href = "/register/pending";
                }
            } else {
                window.location.href = data.user.role === "punter" ? "/dashboard/punter" : "/dashboard";
            }
        } catch {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function goBack() {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
            setError("");
            setSuccess("");
        }
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ width: "100%", maxWidth: "50rem", backgroundColor: "#fff", borderRadius: "1.2rem", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ backgroundColor: "#0f0f0f", padding: "3.2rem 3.2rem 2.4rem", textAlign: "center" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", margin: "0 auto 1.6rem" }} /></a>
                    <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Create Account</h1>
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

                    {/* Step: Choose Type */}
                    {currentStep === "type" && (
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>Choose Account Type</h2>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "2.4rem" }}>
                                Select the type of account you want to create
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                <label
                                    style={{
                                        cursor: "pointer",
                                        padding: "2rem",
                                        backgroundColor: userType === "punter" ? "#fff7f0" : "#f9fafb",
                                        border: `2px solid ${userType === "punter" ? "#ff6b00" : "#e8ebed"}`,
                                        borderRadius: "0.8rem",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="punter"
                                        checked={userType === "punter"}
                                        onChange={() => setUserType("punter")}
                                        style={{ marginRight: "1.2rem" }}
                                    />
                                    <div style={{ display: "inline-block" }}>
                                        <div style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.4rem" }}>
                                            🎯 Punter / Tipster
                                            <span style={{ marginLeft: "0.8rem", padding: "0.2rem 0.8rem", backgroundColor: "#f0fdf4", color: "#16a34a", borderRadius: "0.4rem", fontSize: "1.2rem", fontWeight: 700 }}>FREE</span>
                                        </div>
                                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0 }}>
                                            Post predictions, write articles, and share betting tips with subscribers
                                        </p>
                                    </div>
                                </label>

                                <label
                                    style={{
                                        cursor: "pointer",
                                        padding: "2rem",
                                        backgroundColor: userType === "subscriber" ? "#fff7f0" : "#f9fafb",
                                        border: `2px solid ${userType === "subscriber" ? "#ff6b00" : "#e8ebed"}`,
                                        borderRadius: "0.8rem",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="subscriber"
                                        checked={userType === "subscriber"}
                                        onChange={() => setUserType("subscriber")}
                                        style={{ marginRight: "1.2rem" }}
                                    />
                                    <div style={{ display: "inline-block" }}>
                                        <div style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.4rem" }}>
                                            ⭐ Subscriber
                                            <span style={{ marginLeft: "0.8rem", padding: "0.2rem 0.8rem", backgroundColor: "#fff7f0", color: "#ff6b00", borderRadius: "0.4rem", fontSize: "1.2rem", fontWeight: 700 }}>PAID</span>
                                        </div>
                                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0 }}>
                                            Access expert predictions, daily tips, and premium betting analysis
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handleNext}
                                style={{
                                    width: "100%",
                                    marginTop: "2.4rem",
                                    padding: "1.4rem",
                                    backgroundColor: "#ff6b00",
                                    border: "none",
                                    borderRadius: "0.6rem",
                                    fontFamily: fd,
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step: Name */}
                    {currentStep === "name" && (
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>What's your name?</h2>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "2.4rem" }}>
                                Enter your full name as you'd like it to appear
                            </p>

                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
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

                            <div style={{ display: "flex", gap: "1.2rem" }}>
                                <button
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
                                    onClick={handleNext}
                                    disabled={!name.trim()}
                                    style={{
                                        flex: 2,
                                        padding: "1.4rem",
                                        backgroundColor: name.trim() ? "#ff6b00" : "#ccc",
                                        border: "none",
                                        borderRadius: "0.6rem",
                                        fontFamily: fd,
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: name.trim() ? "pointer" : "not-allowed",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Email */}
                    {currentStep === "email" && (
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>What's your email?</h2>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "2.4rem" }}>
                                We'll send you a verification code
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

                            <div style={{ display: "flex", gap: "1.2rem" }}>
                                <button
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
                                    onClick={handleNext}
                                    disabled={!email.trim() || loading}
                                    style={{
                                        flex: 2,
                                        padding: "1.4rem",
                                        backgroundColor: email.trim() && !loading ? "#ff6b00" : "#ccc",
                                        border: "none",
                                        borderRadius: "0.6rem",
                                        fontFamily: fd,
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: email.trim() && !loading ? "pointer" : "not-allowed",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {loading ? "Sending..." : userType === "subscriber" ? "Continue to Payment" : "Send Code"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Payment (Subscribers only) */}
                    {currentStep === "payment" && (
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>Complete Payment</h2>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "2.4rem" }}>
                                Choose your payment method to activate your subscription
                            </p>

                            <div style={{ display: "flex", gap: "1.2rem", marginBottom: "2.4rem" }}>
                                <button
                                    onClick={() => setPaymentMethod("online")}
                                    style={{
                                        flex: 1,
                                        padding: "1.2rem",
                                        backgroundColor: paymentMethod === "online" ? "#fff7f0" : "#f9fafb",
                                        border: `2px solid ${paymentMethod === "online" ? "#ff6b00" : "#e8ebed"}`,
                                        borderRadius: "0.6rem",
                                        fontFamily: fd,
                                        fontSize: "1.3rem",
                                        fontWeight: 700,
                                        color: paymentMethod === "online" ? "#ff6b00" : "#68676d",
                                        cursor: "pointer",
                                    }}
                                >
                                    💳 Pay Online
                                </button>
                                <button
                                    onClick={() => setPaymentMethod("manual")}
                                    style={{
                                        flex: 1,
                                        padding: "1.2rem",
                                        backgroundColor: paymentMethod === "manual" ? "#fff7f0" : "#f9fafb",
                                        border: `2px solid ${paymentMethod === "manual" ? "#ff6b00" : "#e8ebed"}`,
                                        borderRadius: "0.6rem",
                                        fontFamily: fd,
                                        fontSize: "1.3rem",
                                        fontWeight: 700,
                                        color: paymentMethod === "manual" ? "#ff6b00" : "#68676d",
                                        cursor: "pointer",
                                    }}
                                >
                                    🏦 Bank Transfer
                                </button>
                            </div>

                            {paymentMethod === "manual" && (
                                <div style={{ marginBottom: "2.4rem" }}>
                                    <input
                                        type="text"
                                        value={paymentRef}
                                        onChange={e => setPaymentRef(e.target.value)}
                                        placeholder="Payment Reference"
                                        style={{
                                            width: "100%",
                                            padding: "1.2rem 1.4rem",
                                            border: "2px solid #e8ebed",
                                            borderRadius: "0.6rem",
                                            fontFamily: f,
                                            fontSize: "1.4rem",
                                            marginBottom: "1.2rem",
                                        }}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setProofImage(e.target.files?.[0] || null)}
                                        style={{ fontFamily: f, fontSize: "1.3rem" }}
                                    />
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "1.2rem" }}>
                                <button
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
                                    onClick={handleNext}
                                    disabled={loading}
                                    style={{
                                        flex: 2,
                                        padding: "1.4rem",
                                        backgroundColor: loading ? "#ccc" : "#ff6b00",
                                        border: "none",
                                        borderRadius: "0.6rem",
                                        fontFamily: fd,
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {loading ? "Processing..." : paymentMethod === "online" ? "Pay Now" : "Submit Payment"}
                                </button>
                            </div>
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

                            <button
                                type="submit"
                                disabled={otp.length !== 6 || loading}
                                style={{
                                    width: "100%",
                                    padding: "1.4rem",
                                    backgroundColor: otp.length === 6 && !loading ? "#ff6b00" : "#ccc",
                                    border: "none",
                                    borderRadius: "0.6rem",
                                    fontFamily: fd,
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: otp.length === 6 && !loading ? "pointer" : "not-allowed",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {loading ? "Verifying..." : "Verify & Create Account"}
                            </button>

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
                        Already have an account?{" "}
                        <a href="/login" style={{ color: "#ff6b00", fontWeight: 700, textDecoration: "none" }}>Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
