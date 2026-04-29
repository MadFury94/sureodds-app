"use client";
import { useState, useEffect } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface BetCode {
    id: string;
    bookmaker: string;
    code?: string;
    link?: string;
    image?: string;
    description: string;
    odds: string;
    stake?: string;
    expiresAt: string;
    createdAt: string;
    status: "active" | "expired" | "won" | "lost";
    createdBy: string;
    createdByEmail?: string;
    category?: "free" | "sure-banker" | "premium" | "vip";
    confidence?: string;
}

interface PunterStats {
    id: string;
    name: string;
    email: string;
    totalPredictions: number;
    won: number;
    lost: number;
    pending: number;
    winRate: number;
    totalBetCodes: number;
}

export default function BetCodesViewPage() {
    const [betCodes, setBetCodes] = useState<BetCode[]>([]);
    const [punterStats, setPunterStats] = useState<PunterStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"betcodes" | "stats">("betcodes");
    const [selectedCode, setSelectedCode] = useState<BetCode | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/bet-codes").then(r => r.json()),
            fetch("/api/admin/punter-stats").then(r => r.json()).catch(() => ({ stats: [] })),
        ]).then(([codesData, stats]) => {
            // Handle both response formats: { betCodes: [...] } or direct array
            const codes = codesData.betCodes || codesData || [];
            setBetCodes(codes);
            setPunterStats(stats.stats || []);
            setLoading(false);
        }).catch(err => {
            console.error("Error loading data:", err);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", margin: "0 0 2.4rem" }}>
                Bet Codes & Punter Stats
            </h1>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2.4rem", borderBottom: "2px solid #e8ebed" }}>
                <button
                    onClick={() => setActiveTab("betcodes")}
                    style={{
                        padding: "1.2rem 2.4rem",
                        border: "none",
                        borderBottom: activeTab === "betcodes" ? "3px solid #ff6b00" : "3px solid transparent",
                        backgroundColor: "transparent",
                        fontFamily: fd,
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: activeTab === "betcodes" ? "#ff6b00" : "#68676d",
                        cursor: "pointer",
                        textTransform: "uppercase",
                    }}
                >
                    Bet Codes ({betCodes.length})
                </button>
                <button
                    onClick={() => setActiveTab("stats")}
                    style={{
                        padding: "1.2rem 2.4rem",
                        border: "none",
                        borderBottom: activeTab === "stats" ? "3px solid #ff6b00" : "3px solid transparent",
                        backgroundColor: "transparent",
                        fontFamily: fd,
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: activeTab === "stats" ? "#ff6b00" : "#68676d",
                        cursor: "pointer",
                        textTransform: "uppercase",
                    }}
                >
                    Punter Stats ({punterStats.length})
                </button>
            </div>

            {/* Bet Codes Tab */}
            {activeTab === "betcodes" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(32rem, 1fr))", gap: "2rem" }}>
                    {betCodes.map(code => (
                        <div
                            key={code.id}
                            onClick={() => setSelectedCode(code)}
                            style={{
                                backgroundColor: "#fff",
                                border: "1.5px solid #e8ebed",
                                borderRadius: "1rem",
                                padding: "2rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#ff6b00"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#e8ebed"}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.8rem" }}>
                                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                                    <span style={{
                                        padding: "0.4rem 1rem",
                                        backgroundColor: "#fff5f0",
                                        border: "1px solid #ff6b00",
                                        borderRadius: "0.4rem",
                                        fontFamily: f,
                                        fontSize: "1.2rem",
                                        fontWeight: 700,
                                        color: "#ff6b00",
                                    }}>
                                        {code.bookmaker}
                                    </span>
                                    {code.category && (
                                        <span style={{
                                            padding: "0.4rem 1rem",
                                            backgroundColor:
                                                code.category === "free" ? "#e0f2fe" :
                                                    code.category === "sure-banker" ? "#fef3c7" :
                                                        code.category === "premium" ? "#fce7f3" : "#f3e8ff",
                                            borderRadius: "0.4rem",
                                            fontFamily: f,
                                            fontSize: "1.1rem",
                                            fontWeight: 700,
                                            color:
                                                code.category === "free" ? "#0369a1" :
                                                    code.category === "sure-banker" ? "#ca8a04" :
                                                        code.category === "premium" ? "#be185d" : "#7c3aed",
                                            textTransform: "uppercase",
                                        }}>
                                            {code.category === "free" ? "🆓 Free" :
                                                code.category === "sure-banker" ? "🏦 Sure Banker" :
                                                    code.category === "premium" ? "⭐ Premium" : "👑 VIP"}
                                        </span>
                                    )}
                                </div>
                                <span style={{
                                    padding: "0.4rem 1rem",
                                    backgroundColor: code.status === "active" ? "#dcfce7" : "#fee2e2",
                                    borderRadius: "0.4rem",
                                    fontFamily: f,
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: code.status === "active" ? "#16a34a" : "#dc2626",
                                    textTransform: "uppercase",
                                }}>
                                    {code.status}
                                </span>
                            </div>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", margin: "0 0 1.2rem", lineHeight: 1.5 }}>
                                {code.description}
                            </p>
                            <div style={{ display: "flex", gap: "1.2rem", marginBottom: "1.2rem" }}>
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", margin: "0 0 0.4rem" }}>Total Odds</p>
                                    <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#ff6b00", margin: 0 }}>
                                        {code.odds}
                                    </p>
                                </div>
                                {code.stake && (
                                    <div>
                                        <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", margin: "0 0 0.4rem" }}>Stake</p>
                                        <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                            ₦{code.stake}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: 0 }}>
                                By {code.createdByEmail || code.createdBy} • {new Date(code.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Punter Stats Tab */}
            {activeTab === "stats" && (
                <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb" }}>
                                {["Punter", "Total Tips", "Won", "Lost", "Pending", "Win Rate", "Bet Codes"].map(h => (
                                    <th key={h} style={{
                                        padding: "1.2rem 2rem",
                                        textAlign: "left",
                                        fontFamily: f,
                                        fontSize: "1.2rem",
                                        fontWeight: 700,
                                        color: "#68676d",
                                        textTransform: "uppercase",
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {punterStats.map(punter => (
                                <tr key={punter.id} style={{ borderBottom: "1px solid #e8ebed" }}>
                                    <td style={{ padding: "1.6rem 2rem" }}>
                                        <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>
                                            {punter.name}
                                        </p>
                                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: 0 }}>
                                            {punter.email}
                                        </p>
                                    </td>
                                    <td style={{ padding: "1.6rem 2rem", fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a" }}>
                                        {punter.totalPredictions}
                                    </td>
                                    <td style={{ padding: "1.6rem 2rem", fontFamily: f, fontSize: "1.4rem", fontWeight: 600, color: "#16a34a" }}>
                                        {punter.won}
                                    </td>
                                    <td style={{ padding: "1.6rem 2rem", fontFamily: f, fontSize: "1.4rem", fontWeight: 600, color: "#dc2626" }}>
                                        {punter.lost}
                                    </td>
                                    <td style={{ padding: "1.6rem 2rem", fontFamily: f, fontSize: "1.4rem", fontWeight: 600, color: "#ca8a04" }}>
                                        {punter.pending}
                                    </td>
                                    <td style={{ padding: "1.6rem 2rem" }}>
                                        <span style={{
                                            padding: "0.4rem 1rem",
                                            backgroundColor: punter.winRate >= 60 ? "#dcfce7" : punter.winRate >= 40 ? "#fef3c7" : "#fee2e2",
                                            borderRadius: "0.4rem",
                                            fontFamily: fd,
                                            fontSize: "1.4rem",
                                            fontWeight: 700,
                                            color: punter.winRate >= 60 ? "#16a34a" : punter.winRate >= 40 ? "#ca8a04" : "#dc2626",
                                        }}>
                                            {punter.winRate}%
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.6rem 2rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a" }}>
                                        {punter.totalBetCodes}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bet Code Detail Modal */}
            {selectedCode && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "2rem",
                    }}
                    onClick={() => setSelectedCode(null)}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: "1.2rem",
                            maxWidth: "60rem",
                            width: "100%",
                            padding: "3.2rem",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 2rem" }}>
                            Bet Code Details
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Bookmaker</p>
                                    <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                        {selectedCode.bookmaker}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Status</p>
                                    <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0, textTransform: "uppercase" }}>
                                        {selectedCode.status}
                                    </p>
                                </div>
                            </div>
                            {(selectedCode.category || selectedCode.confidence) && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
                                    {selectedCode.category && (
                                        <div>
                                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Category</p>
                                            <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0, textTransform: "capitalize" }}>
                                                {selectedCode.category === "free" ? "🆓 Free" :
                                                    selectedCode.category === "sure-banker" ? "🏦 Sure Banker" :
                                                        selectedCode.category === "premium" ? "⭐ Premium" : "👑 VIP"}
                                            </p>
                                        </div>
                                    )}
                                    {selectedCode.confidence && (
                                        <div>
                                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Confidence</p>
                                            <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                                {selectedCode.confidence}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Total Odds</p>
                                    <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#ff6b00", margin: 0 }}>
                                        {selectedCode.odds || "-"}
                                    </p>
                                </div>
                                {selectedCode.stake && (
                                    <div>
                                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Recommended Stake</p>
                                        <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                            ₦{selectedCode.stake}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div style={{ backgroundColor: "#f9fafb", padding: "1.6rem", borderRadius: "0.8rem", border: "1px solid #e8ebed" }}>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Created By</p>
                                <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                    {selectedCode.createdByEmail || selectedCode.createdBy}
                                </p>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.4rem 0 0" }}>
                                    {new Date(selectedCode.createdAt).toLocaleString("en-GB")}
                                </p>
                            </div>
                            {selectedCode.code && (
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Booking Code</p>
                                    <p style={{ fontFamily: "monospace", fontSize: "1.8rem", fontWeight: 700, color: "#ff6b00", margin: 0, letterSpacing: "0.1em" }}>
                                        {selectedCode.code}
                                    </p>
                                </div>
                            )}
                            {selectedCode.link && (
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Bet Slip Link</p>
                                    <a href={selectedCode.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: f, fontSize: "1.4rem", color: "#ff6b00", wordBreak: "break-all" }}>
                                        {selectedCode.link}
                                    </a>
                                </div>
                            )}
                            {selectedCode.image && (
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.8rem" }}>Bet Slip Image</p>
                                    <img src={selectedCode.image} alt="Bet slip" style={{ maxWidth: "100%", borderRadius: "0.8rem", border: "1px solid #e8ebed" }} />
                                </div>
                            )}
                            <div>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Description</p>
                                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", margin: 0, lineHeight: 1.6 }}>
                                    {selectedCode.description}
                                </p>
                            </div>
                            {selectedCode.expiresAt && (
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>Expires At</p>
                                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#dc2626", margin: 0 }}>
                                        {new Date(selectedCode.expiresAt).toLocaleString("en-GB")}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedCode(null)}
                            style={{
                                marginTop: "2.4rem",
                                padding: "1rem 2.4rem",
                                backgroundColor: "#1a1a1a",
                                border: "none",
                                borderRadius: "0.6rem",
                                fontFamily: fd,
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                color: "#fff",
                                cursor: "pointer",
                                width: "100%",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
