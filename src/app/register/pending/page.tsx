"use client";
import { useEffect, useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function PendingApprovalPage() {
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

    useEffect(() => {
        fetch("/api/auth/me")
            .then(r => r.json())
            .then(d => {
                if (d.user) setUser(d.user);
            })
            .catch(() => { });
    }, []);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ width: "100%", maxWidth: "56rem", backgroundColor: "#fff", borderRadius: "1.2rem", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>

                {/* Header */}
                <div style={{ backgroundColor: "#0f0f0f", padding: "3.2rem", textAlign: "center" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", margin: "0 auto 1.6rem" }} /></a>
                    <div style={{ fontSize: "4rem", marginBottom: "1.6rem" }}>⏳</div>
                    <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        Account Pending Approval
                    </h1>
                </div>

                {/* Content */}
                <div style={{ padding: "3.2rem" }}>
                    {user && (
                        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e8ebed", borderRadius: "0.8rem", padding: "2rem", marginBottom: "2.4rem" }}>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", margin: "0 0 0.8rem" }}>
                                <strong style={{ color: "#1a1a1a" }}>Name:</strong> {user.name}
                            </p>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", margin: "0 0 0.8rem" }}>
                                <strong style={{ color: "#1a1a1a" }}>Email:</strong> {user.email}
                            </p>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", margin: 0 }}>
                                <strong style={{ color: "#1a1a1a" }}>Account Type:</strong> {user.role === "punter" ? "Punter / Tipster" : "Subscriber"}
                            </p>
                        </div>
                    )}

                    <div style={{ textAlign: "center", marginBottom: "2.4rem" }}>
                        <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 1.2rem" }}>
                            Thank You for Registering!
                        </h2>
                        <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", lineHeight: 1.7, margin: "0 0 1.6rem" }}>
                            Your account has been created successfully and is currently pending admin approval.
                        </p>
                        <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", lineHeight: 1.7, margin: 0 }}>
                            You will receive an email notification once your account has been approved. This usually takes 24-48 hours.
                        </p>
                    </div>

                    {/* Info boxes */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "2.4rem" }}>
                        <div style={{ backgroundColor: "#fff9f0", border: "1px solid #ffd699", borderRadius: "0.8rem", padding: "1.6rem", display: "flex", gap: "1.2rem" }}>
                            <span style={{ fontSize: "2rem", flexShrink: 0 }}>📧</span>
                            <div>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>Check Your Email</p>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0, lineHeight: 1.6 }}>
                                    We'll send you a confirmation email once your account is approved.
                                </p>
                            </div>
                        </div>

                        {user?.role === "subscriber" && (
                            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.8rem", padding: "1.6rem", display: "flex", gap: "1.2rem" }}>
                                <span style={{ fontSize: "2rem", flexShrink: 0 }}>💳</span>
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>Payment After Approval</p>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0, lineHeight: 1.6 }}>
                                        Once approved, you'll be able to complete your subscription payment and access all predictions.
                                    </p>
                                </div>
                            </div>
                        )}

                        {user?.role === "punter" && (
                            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.8rem", padding: "1.6rem", display: "flex", gap: "1.2rem" }}>
                                <span style={{ fontSize: "2rem", flexShrink: 0 }}>✍️</span>
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>Start Posting After Approval</p>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0, lineHeight: 1.6 }}>
                                        Once approved, you'll have access to post blog articles and betting tips.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                        <a href="/" style={{
                            display: "inline-block",
                            padding: "1.3rem 3.2rem",
                            backgroundColor: "#ff6b00",
                            color: "#fff",
                            borderRadius: "0.8rem",
                            fontFamily: fd,
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                        }}>
                            Return to Homepage
                        </a>
                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f", margin: "0.8rem 0 0" }}>
                            Already approved? <a href="/login" style={{ color: "#ff6b00", fontWeight: 700 }}>Sign in here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
