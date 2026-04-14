"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function MagicLinkPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setError("Missing authentication token.");
            return;
        }

        // The API endpoint will handle the authentication and redirect
        // This page is just shown briefly during the process
        fetch(`/api/auth/magic?token=${token}`)
            .then(res => {
                if (res.redirected) {
                    window.location.href = res.url;
                } else if (!res.ok) {
                    return res.json().then(data => {
                        throw new Error(data.error || "Authentication failed");
                    });
                }
            })
            .catch(err => {
                setStatus("error");
                setError(err.message || "Authentication failed. Please try logging in normally.");
            });
    }, [searchParams]);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ width: "100%", maxWidth: "44rem", backgroundColor: "#fff", borderRadius: "1.2rem", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ backgroundColor: "#0f0f0f", padding: "3.2rem 3.2rem 2.4rem", textAlign: "center" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", margin: "0 auto 1.6rem" }} /></a>
                    <h1 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        {status === "verifying" ? "Verifying..." : status === "success" ? "Success!" : "Authentication Failed"}
                    </h1>
                </div>

                {/* Content */}
                <div style={{ padding: "3.2rem", textAlign: "center" }}>
                    {status === "verifying" && (
                        <>
                            <div style={{ width: "4rem", height: "4rem", border: "4px solid #e8ebed", borderTop: "4px solid #ff6b00", borderRadius: "50%", margin: "0 auto 2rem", animation: "spin 1s linear infinite" }} />
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", margin: 0 }}>
                                Authenticating your account...
                            </p>
                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div style={{ width: "6rem", height: "6rem", backgroundColor: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
                                <span style={{ fontSize: "3rem" }}>✓</span>
                            </div>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#16a34a", fontWeight: 700, margin: "0 0 1rem" }}>
                                Authentication Successful!
                            </p>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0 }}>
                                Redirecting to your dashboard...
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div style={{ width: "6rem", height: "6rem", backgroundColor: "#fff0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
                                <span style={{ fontSize: "3rem", color: "#dc2626" }}>✕</span>
                            </div>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#dc2626", fontWeight: 700, margin: "0 0 1rem" }}>
                                {error}
                            </p>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: "0 0 2rem" }}>
                                This link may have expired or already been used.
                            </p>
                            <a href="/login" style={{ display: "inline-block", padding: "1.2rem 3.2rem", backgroundColor: "#ff6b00", color: "#fff", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                Go to Login
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
