"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface BetCode {
    id: string;
    bookmaker: string;
    code: string;
    link?: string;
    image?: string;
    description: string;
    odds: string;
    stake?: string;
    expiresAt: string;
    createdAt: string;
    status: "active" | "expired" | "won" | "lost";
}

const BOOKMAKERS = [
    "Bet9ja",
    "SportyBet",
    "1xBet",
    "Betway",
    "NairaBet",
    "BetKing",
    "22Bet",
    "MerryBet",
    "Other",
];

export default function BetCodesPage() {
    const router = useRouter();
    const [betCodes, setBetCodes] = useState<BetCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [form, setForm] = useState({
        bookmaker: "Bet9ja",
        code: "",
        link: "",
        image: "",
        description: "",
        odds: "",
        stake: "",
        expiresAt: "",
    });

    useEffect(() => {
        loadBetCodes();
    }, []);

    async function loadBetCodes() {
        setLoading(true);
        try {
            const res = await fetch("/api/bet-codes");
            const data = await res.json();
            setBetCodes(data.betCodes || []);
        } catch (error) {
            console.error("Failed to load bet codes:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.code && !form.link && !form.image) {
            alert("Please provide at least a code, link, or image");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/bet-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setShowForm(false);
                setForm({
                    bookmaker: "Bet9ja",
                    code: "",
                    link: "",
                    image: "",
                    description: "",
                    odds: "",
                    stake: "",
                    expiresAt: "",
                });
                loadBetCodes();
            } else {
                alert("Failed to post bet code");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this bet code?")) return;

        try {
            const res = await fetch(`/api/bet-codes/${id}`, { method: "DELETE" });
            if (res.ok) {
                loadBetCodes();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "1.2rem 1.6rem",
        border: "2px solid #e8ebed",
        borderRadius: "0.8rem",
        fontFamily: f,
        fontSize: "1.4rem",
        color: "#1a1a1a",
        outline: "none",
        transition: "border-color 0.2s",
    };

    return (
        <div style={{ maxWidth: "100rem", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3.2rem", flexWrap: "wrap", gap: "1.6rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.8rem" }}>
                        Bet Codes
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                        Share betting slip codes with subscribers
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: "1.4rem 3.2rem",
                        backgroundColor: "#ff6b00",
                        border: "none",
                        borderRadius: "0.8rem",
                        fontFamily: fd,
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)",
                    }}
                >
                    + Share Bet Code
                </button>
            </div>

            {/* Bet Codes Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "6rem" }}>
                    <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>Loading bet codes...</p>
                </div>
            ) : betCodes.length === 0 ? (
                <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", padding: "6rem", textAlign: "center" }}>
                    <div style={{ fontSize: "6rem", marginBottom: "1.6rem", opacity: 0.3 }}>🎫</div>
                    <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d", marginBottom: "2.4rem" }}>
                        No bet codes shared yet
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            padding: "1.2rem 3.2rem",
                            backgroundColor: "#ff6b00",
                            border: "none",
                            borderRadius: "0.8rem",
                            fontFamily: fd,
                            fontSize: "1.4rem",
                            fontWeight: 700,
                            color: "#fff",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                        }}
                    >
                        Share Your First Bet Code
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(32rem, 1fr))", gap: "2rem" }}>
                    {betCodes.map((betCode) => (
                        <div
                            key={betCode.id}
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "1.2rem",
                                border: "2px solid #e8ebed",
                                padding: "2.4rem",
                                position: "relative",
                            }}
                        >
                            {/* Status Badge */}
                            <div style={{
                                position: "absolute",
                                top: "1.6rem",
                                right: "1.6rem",
                                padding: "0.4rem 1.2rem",
                                borderRadius: "10rem",
                                backgroundColor: betCode.status === "active" ? "#f0fdf4" : betCode.status === "won" ? "#dcfce7" : betCode.status === "lost" ? "#fee2e2" : "#f3f4f6",
                                border: `1px solid ${betCode.status === "active" ? "#86efac" : betCode.status === "won" ? "#22c55e" : betCode.status === "lost" ? "#fca5a5" : "#d1d5db"}`,
                                fontFamily: f,
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: betCode.status === "active" ? "#16a34a" : betCode.status === "won" ? "#15803d" : betCode.status === "lost" ? "#dc2626" : "#6b7280",
                                textTransform: "uppercase",
                            }}>
                                {betCode.status}
                            </div>

                            {/* Bookmaker */}
                            <div style={{ marginBottom: "1.6rem" }}>
                                <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>
                                    {betCode.bookmaker}
                                </p>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: 0 }}>
                                    {new Date(betCode.createdAt).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            {/* Code */}
                            {betCode.code && (
                                <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.8rem", padding: "1.6rem", marginBottom: "1.6rem", border: "1px solid #e8ebed" }}>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                        Booking Code
                                    </p>
                                    <p style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: 700, color: "#ff6b00", margin: 0, letterSpacing: "0.1em" }}>
                                        {betCode.code}
                                    </p>
                                </div>
                            )}

                            {/* Link */}
                            {betCode.link && (
                                <a
                                    href={betCode.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "block",
                                        padding: "1.2rem",
                                        backgroundColor: "#fff9f5",
                                        border: "1px solid #ff6b00",
                                        borderRadius: "0.6rem",
                                        fontFamily: f,
                                        fontSize: "1.3rem",
                                        color: "#ff6b00",
                                        textDecoration: "none",
                                        marginBottom: "1.6rem",
                                        textAlign: "center",
                                        fontWeight: 700,
                                    }}
                                >
                                    🔗 Open Bet Slip
                                </a>
                            )}

                            {/* Image */}
                            {betCode.image && (
                                <img
                                    src={betCode.image}
                                    alt="Bet slip"
                                    style={{
                                        width: "100%",
                                        borderRadius: "0.8rem",
                                        marginBottom: "1.6rem",
                                        border: "1px solid #e8ebed",
                                    }}
                                />
                            )}

                            {/* Description */}
                            {betCode.description && (
                                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#3d3c41", margin: "0 0 1.6rem", lineHeight: 1.6 }}>
                                    {betCode.description}
                                </p>
                            )}

                            {/* Odds & Stake */}
                            <div style={{ display: "flex", gap: "1.2rem", marginBottom: "1.6rem" }}>
                                {betCode.odds && (
                                    <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: "0.6rem", padding: "1rem", border: "1px solid #e8ebed" }}>
                                        <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            Total Odds
                                        </p>
                                        <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                            {betCode.odds}
                                        </p>
                                    </div>
                                )}
                                {betCode.stake && (
                                    <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: "0.6rem", padding: "1rem", border: "1px solid #e8ebed" }}>
                                        <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            Stake
                                        </p>
                                        <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                            ₦{betCode.stake}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Expires */}
                            {betCode.expiresAt && (
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0 0 1.6rem" }}>
                                    Expires: {new Date(betCode.expiresAt).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            )}

                            {/* Actions */}
                            <button
                                onClick={() => handleDelete(betCode.id)}
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    backgroundColor: "#fff0f0",
                                    border: "1px solid #fca5a5",
                                    borderRadius: "0.6rem",
                                    fontFamily: f,
                                    fontSize: "1.3rem",
                                    fontWeight: 700,
                                    color: "#dc2626",
                                    cursor: "pointer",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 100,
                    padding: "2rem",
                }}>
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "1.2rem",
                        width: "100%",
                        maxWidth: "60rem",
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: "2.4rem",
                            borderBottom: "1px solid #e8ebed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "sticky",
                            top: 0,
                            backgroundColor: "#fff",
                            zIndex: 1,
                        }}>
                            <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                                Share Bet Code
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "2.4rem",
                                    color: "#68676d",
                                    cursor: "pointer",
                                    lineHeight: 1,
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ padding: "2.4rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {/* Bookmaker */}
                            <div>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                    Bookmaker *
                                </label>
                                <select
                                    value={form.bookmaker}
                                    onChange={(e) => setForm({ ...form, bookmaker: e.target.value })}
                                    style={inputStyle}
                                    required
                                    onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                >
                                    {BOOKMAKERS.map((bm) => (
                                        <option key={bm} value={bm}>{bm}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Booking Code */}
                            <div>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                    Booking Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., ABC123XYZ"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    style={{ ...inputStyle, fontFamily: "monospace", fontSize: "1.6rem", letterSpacing: "0.1em" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                />
                            </div>

                            {/* Bet Slip Link */}
                            <div>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                    Bet Slip Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={form.link}
                                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                    Bet Slip Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                />
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.6rem 0 0" }}>
                                    Upload your bet slip screenshot to an image host (e.g., Imgur) and paste the URL
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                    Description
                                </label>
                                <textarea
                                    placeholder="Brief description of this bet slip..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                />
                            </div>

                            {/* Odds & Stake */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                        Total Odds
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 25.50"
                                        value={form.odds}
                                        onChange={(e) => setForm({ ...form, odds: e.target.value })}
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                        Recommended Stake (₦)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 1000"
                                        value={form.stake}
                                        onChange={(e) => setForm({ ...form, stake: e.target.value })}
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                    />
                                </div>
                            </div>

                            {/* Expires At */}
                            <div>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                    Expires At (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e8ebed")}
                                />
                            </div>

                            {/* Submit */}
                            <div style={{ display: "flex", gap: "1.2rem", paddingTop: "1.6rem", borderTop: "1px solid #e8ebed" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        flex: 1,
                                        padding: "1.4rem",
                                        backgroundColor: "#fff",
                                        border: "2px solid #e8ebed",
                                        borderRadius: "0.8rem",
                                        fontFamily: fd,
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "#68676d",
                                        cursor: "pointer",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        flex: 1,
                                        padding: "1.4rem",
                                        backgroundColor: saving ? "#ccc" : "#ff6b00",
                                        border: "none",
                                        borderRadius: "0.8rem",
                                        fontFamily: fd,
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: saving ? "not-allowed" : "pointer",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    {saving ? "Sharing..." : "Share Bet Code"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
