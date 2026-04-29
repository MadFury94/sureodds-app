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
    category: "free" | "sure-banker" | "premium" | "vip";
    confidence?: string;
}

const BOOKMAKERS = ["Bet9ja", "SportyBet", "1xBet", "Betway", "NairaBet", "BetKing", "22Bet", "MerryBet", "Other"];
const CATEGORIES = [
    { value: "free", label: "Free", icon: "🆓", color: "#22c55e" },
    { value: "sure-banker", label: "Sure Banker", icon: "🏦", color: "#ff6b00" },
    { value: "premium", label: "Premium", icon: "⭐", color: "#8b5cf6" },
    { value: "vip", label: "VIP", icon: "👑", color: "#eab308" },
];
const CONFIDENCE_LEVELS = ["Low", "Medium", "High", "Banker"];

export default function BetCodesPage() {
    const router = useRouter();
    const [betCodes, setBetCodes] = useState<BetCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        bookmaker: "Bet9ja",
        code: "",
        link: "",
        image: "",
        description: "",
        odds: "",
        stake: "",
        expiresAt: "",
        category: "free",
        confidence: "High",
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
                    category: "free",
                    confidence: "High",
                });
                loadBetCodes();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to post bet code");
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
            } else {
                const error = await res.json();
                alert(error.error || "Failed to delete bet code");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to delete bet code");
        }
    }

    const getCategoryInfo = (category: string) => {
        return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "1rem 1.2rem",
        border: "1px solid #e8ebed",
        borderRadius: "0.6rem",
        fontFamily: f,
        fontSize: "1.3rem",
        color: "#1a1a1a",
        outline: "none",
    };

    return (
        <div style={{ maxWidth: "140rem", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.4rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.6rem" }}>
                        Bet Codes Management
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", margin: 0 }}>
                        Share and manage your betting codes
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: "1.2rem 2.4rem",
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
                        boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                    }}
                >
                    <span style={{ fontSize: "1.8rem" }}>+</span>
                    Add Bet Code
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "6rem", backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed" }}>
                    <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>Loading bet codes...</p>
                </div>
            ) : betCodes.length === 0 ? (
                <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "6rem", textAlign: "center" }}>
                    <div style={{ fontSize: "6rem", marginBottom: "1.6rem", opacity: 0.3 }}>🎫</div>
                    <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d", marginBottom: "2rem" }}>
                        No bet codes yet. Start sharing your picks!
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
                        Add Your First Bet Code
                    </button>
                </div>
            ) : (
                <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e8ebed" }}>
                                    <th style={{ padding: "1.6rem", textAlign: "left", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Bookmaker
                                    </th>
                                    <th style={{ padding: "1.6rem", textAlign: "left", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Code
                                    </th>
                                    <th style={{ padding: "1.6rem", textAlign: "left", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Category
                                    </th>
                                    <th style={{ padding: "1.6rem", textAlign: "left", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Confidence
                                    </th>
                                    <th style={{ padding: "1.6rem", textAlign: "left", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Odds
                                    </th>
                                    <th style={{ padding: "1.6rem", textAlign: "left", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Status
                                    </th>
                                    <th style={{ padding: "1.6rem", textAlign: "left", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Created
                                    </th>
                                    <th style={{ padding: "1.6rem", textAlign: "center", fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {betCodes.map((betCode) => {
                                    const categoryInfo = getCategoryInfo(betCode.category);
                                    return (
                                        <tr key={betCode.id} style={{ borderBottom: "1px solid #e8ebed" }}>
                                            <td style={{ padding: "1.6rem" }}>
                                                <div style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                    {betCode.bookmaker}
                                                </div>
                                                {betCode.description && (
                                                    <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginTop: "0.4rem" }}>
                                                        {betCode.description.length > 50 ? betCode.description.substring(0, 50) + "..." : betCode.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: "1.6rem" }}>
                                                {betCode.code ? (
                                                    <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: "#ff6b00", letterSpacing: "0.05em" }}>
                                                        {betCode.code}
                                                    </div>
                                                ) : betCode.link ? (
                                                    <a href={betCode.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: f, fontSize: "1.3rem", color: "#ff6b00", textDecoration: "none" }}>
                                                        🔗 Link
                                                    </a>
                                                ) : (
                                                    <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f" }}>Image only</span>
                                                )}
                                            </td>
                                            <td style={{ padding: "1.6rem" }}>
                                                <div style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.6rem",
                                                    padding: "0.4rem 1rem",
                                                    borderRadius: "10rem",
                                                    backgroundColor: `${categoryInfo.color}15`,
                                                    border: `1px solid ${categoryInfo.color}40`,
                                                }}>
                                                    <span style={{ fontSize: "1.2rem" }}>{categoryInfo.icon}</span>
                                                    <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 600, color: categoryInfo.color }}>
                                                        {categoryInfo.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.6rem" }}>
                                                <div style={{
                                                    display: "inline-block",
                                                    padding: "0.4rem 1rem",
                                                    borderRadius: "0.4rem",
                                                    backgroundColor: betCode.confidence === "Banker" ? "#dcfce7" : betCode.confidence === "High" ? "#fef3c7" : "#f3f4f6",
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    fontWeight: 600,
                                                    color: betCode.confidence === "Banker" ? "#16a34a" : betCode.confidence === "High" ? "#ca8a04" : "#6b7280",
                                                }}>
                                                    {betCode.confidence || "Medium"}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.6rem" }}>
                                                <div style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                    {betCode.odds || "-"}
                                                </div>
                                                {betCode.stake && (
                                                    <div style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginTop: "0.2rem" }}>
                                                        ₦{betCode.stake}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: "1.6rem" }}>
                                                <div style={{
                                                    display: "inline-block",
                                                    padding: "0.4rem 1rem",
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
                                            </td>
                                            <td style={{ padding: "1.6rem" }}>
                                                <div style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a" }}>
                                                    {new Date(betCode.createdAt).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </div>
                                                <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", marginTop: "0.2rem" }}>
                                                    {new Date(betCode.createdAt).toLocaleTimeString("en-GB", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.6rem", textAlign: "center" }}>
                                                <button
                                                    onClick={() => handleDelete(betCode.id)}
                                                    style={{
                                                        padding: "0.6rem 1.2rem",
                                                        backgroundColor: "#fff0f0",
                                                        border: "1px solid #fca5a5",
                                                        borderRadius: "0.4rem",
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        fontWeight: 600,
                                                        color: "#dc2626",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Form Modal */}
            {showForm && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
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
                        maxWidth: "70rem",
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: "2rem",
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
                                Add New Bet Code
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
                        <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
                                {/* Bookmaker */}
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Bookmaker *
                                    </label>
                                    <select
                                        value={form.bookmaker}
                                        onChange={(e) => setForm({ ...form, bookmaker: e.target.value })}
                                        style={inputStyle}
                                        required
                                    >
                                        {BOOKMAKERS.map((bm) => (
                                            <option key={bm} value={bm}>{bm}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Booking Code */}
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Booking Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="ABC123XYZ"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: "0.1em" }}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Category *
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                                        style={inputStyle}
                                        required
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Confidence */}
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Confidence *
                                    </label>
                                    <select
                                        value={form.confidence}
                                        onChange={(e) => setForm({ ...form, confidence: e.target.value })}
                                        style={inputStyle}
                                        required
                                    >
                                        {CONFIDENCE_LEVELS.map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Odds */}
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Total Odds
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="25.50"
                                        value={form.odds}
                                        onChange={(e) => setForm({ ...form, odds: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Stake */}
                                <div>
                                    <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                        Recommended Stake (₦)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="1000"
                                        value={form.stake}
                                        onChange={(e) => setForm({ ...form, stake: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Bet Slip Link */}
                            <div style={{ marginTop: "1.6rem" }}>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                    Bet Slip Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={form.link}
                                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Image URL */}
                            <div style={{ marginTop: "1.6rem" }}>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                    Bet Slip Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Description */}
                            <div style={{ marginTop: "1.6rem" }}>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                    Description
                                </label>
                                <textarea
                                    placeholder="Brief description..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>

                            {/* Expires At */}
                            <div style={{ marginTop: "1.6rem" }}>
                                <label style={{ display: "block", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                                    Expires At (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Submit */}
                            <div style={{ display: "flex", gap: "1.2rem", marginTop: "2.4rem", paddingTop: "2rem", borderTop: "1px solid #e8ebed" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        flex: 1,
                                        padding: "1.2rem",
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
                                        padding: "1.2rem",
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
                                    {saving ? "Saving..." : "Add Bet Code"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
