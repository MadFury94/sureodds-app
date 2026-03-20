"use client";
import { useState, useEffect } from "react";
import { fonts } from "@/lib/config";
import type { SiteSettings } from "@/lib/settings";

const f = fonts.body;
const fd = fonts.display;

export default function SubscribePage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [user, setUser] = useState<{ name: string; email: string; status: string; paymentRef: string | null } | null>(null);
    const [paymentRef, setPaymentRef] = useState("");
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [initiating, setInitiating] = useState(false);
    const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
    const [tab, setTab] = useState<"online" | "manual">("online");

    useEffect(() => {
        Promise.all([
            fetch("/api/auth/me").then(r => r.json()),
            fetch("/api/settings-public").then(r => r.json()),
        ]).then(([userData, settingsData]) => {
            if (userData.user) setUser(userData.user);
            if (settingsData.settings) setSettings(settingsData.settings);
        });

        const params = new URLSearchParams(window.location.search);
        if (params.get("error") === "payment_failed") setMsg({ type: "err", text: "Payment was not completed. Please try again." });
        if (params.get("expired")) setMsg({ type: "err", text: "Your subscription has expired. Please renew to continue." });
    }, []);

    async function handleOnlinePay() {
        setInitiating(true);
        setMsg(null);
        try {
            const res = await fetch("/api/payment/initiate", { method: "POST" });
            const data = await res.json();
            if (!res.ok) { setMsg({ type: "err", text: data.error }); return; }
            window.location.href = data.checkoutUrl;
        } catch {
            setMsg({ type: "err", text: "Could not connect to payment gateway." });
        } finally {
            setInitiating(false);
        }
    }

    async function handleManualSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!paymentRef.trim()) return;
        setSubmitting(true);
        setMsg(null);
        try {
            const formData = new FormData();
            formData.append("paymentRef", paymentRef.trim());
            if (proofImage) formData.append("proofImage", proofImage);

            const res = await fetch("/api/payment/manual", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) { setMsg({ type: "err", text: data.error }); return; }
            setMsg({ type: "ok", text: "Payment submitted. Your account will be activated once admin confirms your payment." });
            setPaymentRef("");
            setProofImage(null);
        } catch {
            setMsg({ type: "err", text: "Submission failed. Please try again." });
        } finally {
            setSubmitting(false);
        }
    }

    const price = settings ? `${settings.subscriptionCurrency} ${settings.subscriptionPrice.toLocaleString()}` : "…";

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f6", padding: "4rem 1.6rem" }}>
            <div style={{ maxWidth: "56rem", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "3.2rem" }}>
                    <a href="/"><img src="/logo.png" alt="Sureodds" style={{ height: "3.6rem", margin: "0 auto 1.6rem" }} /></a>
                    <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.8rem" }}>
                        Subscribe to Betting Tips
                    </h1>
                    {user && <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>Welcome, {user.name}. Complete your payment to activate your account.</p>}
                </div>

                {/* Price card */}
                <div style={{ backgroundColor: "#0f0f0f", borderRadius: "1.2rem", padding: "3.2rem", textAlign: "center", marginBottom: "2.4rem" }}>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Monthly Subscription</p>
                    <p style={{ fontFamily: fd, fontSize: "4rem", fontWeight: 700, color: "#ff6b00", margin: "0 0 0.4rem" }}>{price}</p>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#555" }}>per month · cancel anytime</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "2.4rem", marginTop: "2rem", flexWrap: "wrap" }}>
                        {["Daily betting tips", "Expert analysis", "Win/loss tracking", "Members dashboard"].map(f2 => (
                            <span key={f2} style={{ fontFamily: f, fontSize: "1.3rem", color: "#aaa", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "#ff6b00" }}>✓</span> {f2}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                {msg && (
                    <div style={{ padding: "1.2rem 1.6rem", backgroundColor: msg.type === "ok" ? "#f0fdf4" : "#fff0f0", border: `1px solid ${msg.type === "ok" ? "#86efac" : "#fca5a5"}`, borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: msg.type === "ok" ? "#16a34a" : "#dc2626", marginBottom: "2rem" }}>
                        {msg.text}
                    </div>
                )}

                {/* Payment tabs */}
                <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #e8ebed" }}>
                        {(["online", "manual"] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "1.6rem", fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", border: "none", cursor: "pointer", backgroundColor: tab === t ? "#fff" : "#f9fafb", color: tab === t ? "#ff6b00" : "#68676d", borderBottom: tab === t ? "2px solid #ff6b00" : "2px solid transparent" }}>
                                {t === "online" ? "💳 Pay Online" : "🏦 Bank Transfer"}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: "3.2rem" }}>
                        {tab === "online" ? (
                            <div style={{ textAlign: "center" }}>
                                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", marginBottom: "2.4rem", lineHeight: 1.6 }}>
                                    Pay securely via Paystack. Your account is activated instantly after payment.
                                </p>
                                <button onClick={handleOnlinePay} disabled={initiating} style={{ padding: "1.4rem 4rem", backgroundColor: initiating ? "#ccc" : "#ff6b00", border: "none", borderRadius: "0.8rem", fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#fff", cursor: initiating ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    {initiating ? "Redirecting…" : `Pay ${price}`}
                                </button>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", marginTop: "1.6rem" }}>Secured by Paystack · Visa · Mastercard · Bank Transfer</p>
                            </div>
                        ) : (
                            <div>
                                {settings && (
                                    <>
                                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", marginBottom: "2rem", lineHeight: 1.6 }}>
                                            {settings.manualPaymentInstructions}
                                        </p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "2.8rem" }}>
                                            {settings.bankAccounts.map((acct, i) => (
                                                <div key={i} style={{ backgroundColor: "#f9fafb", border: "1px solid #e8ebed", borderRadius: "0.8rem", padding: "1.6rem 2rem" }}>
                                                    <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.8rem" }}>{acct.bankName}</p>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>Account Name: <strong style={{ color: "#1a1a1a" }}>{acct.accountName}</strong></span>
                                                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>Account Number: <strong style={{ color: "#1a1a1a", fontSize: "1.6rem", letterSpacing: "0.08em" }}>{acct.accountNumber}</strong></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <form onSubmit={handleManualSubmit}>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Payment Reference / Transaction ID
                                    </label>
                                    <input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="e.g. TRF2024XXXXXXXX" required
                                        style={{ width: "100%", padding: "1.1rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", marginBottom: "1.6rem", boxSizing: "border-box" }}
                                        onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                                        onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                                    />
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Proof of Payment <span style={{ fontWeight: 400, color: "#99989f" }}>(screenshot / receipt image)</span>
                                    </label>
                                    <div style={{ border: "1.5px dashed #e8ebed", borderRadius: "0.6rem", padding: "1.6rem", textAlign: "center", marginBottom: "1.6rem", backgroundColor: "#f9fafb", cursor: "pointer" }}
                                        onClick={() => document.getElementById("proofInput")?.click()}>
                                        {proofImage ? (
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                                                <img src={URL.createObjectURL(proofImage)} alt="proof" style={{ height: "6rem", borderRadius: "0.4rem", objectFit: "cover" }} />
                                                <div style={{ textAlign: "left" }}>
                                                    <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{proofImage.name}</p>
                                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0.2rem 0 0" }}>{(proofImage.size / 1024).toFixed(0)} KB</p>
                                                    <button type="button" onClick={e => { e.stopPropagation(); setProofImage(null); }} style={{ marginTop: "0.4rem", fontFamily: f, fontSize: "1.1rem", color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f", margin: 0 }}>📎 Click to upload image (JPG, PNG, max 5MB)</p>
                                        )}
                                        <input id="proofInput" type="file" accept="image/*" style={{ display: "none" }}
                                            onChange={e => setProofImage(e.target.files?.[0] ?? null)} />
                                    </div>
                                    <button type="submit" disabled={submitting} style={{ width: "100%", padding: "1.3rem", backgroundColor: submitting ? "#ccc" : "#1a1a1a", border: "none", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                        {submitting ? "Submitting…" : "Submit Payment"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f", textAlign: "center", marginTop: "2rem" }}>
                    Already paid? <a href="/login" style={{ color: "#ff6b00", fontWeight: 700 }}>Sign in</a>
                </p>
            </div>
        </div>
    );
}
