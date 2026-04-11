"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Stats {
    totalPredictions: number;
    totalPosts: number;
    wonPredictions: number;
    lostPredictions: number;
    pendingPredictions: number;
}

interface Tip {
    id: number;
    league: string;
    home: string;
    away: string;
    outcome: string;
    confidence: string;
    result: string;
    matchDate: string;
}

export default function PunterDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [stats, setStats] = useState<Stats>({ totalPredictions: 0, totalPosts: 0, wonPredictions: 0, lostPredictions: 0, pendingPredictions: 0 });
    const [recentTips, setRecentTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/auth/me").then(r => r.json()),
            fetch("/api/tips").then(r => r.json()),
        ]).then(([userData, tipsData]) => {
            if (userData.user) {
                if (userData.user.role !== "punter") {
                    router.push("/dashboard");
                    return;
                }
                setUser(userData.user);
            }

            const tips = tipsData || [];
            setStats({
                totalPredictions: tips.length,
                totalPosts: 0,
                wonPredictions: tips.filter((t: { result: string }) => t.result === "won").length,
                lostPredictions: tips.filter((t: { result: string }) => t.result === "lost").length,
                pendingPredictions: tips.filter((t: { result: string }) => t.result === "pending").length,
            });

            // Get the 5 most recent predictions
            setRecentTips(tips.slice(-5).reverse());
            setLoading(false);
        });
    }, [router, searchParams]);

    const winRate = stats.totalPredictions > 0
        ? Math.round((stats.wonPredictions / (stats.wonPredictions + stats.lostPredictions)) * 100) || 0
        : 0;

    return (
        <div style={{ maxWidth: "120rem", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "3.2rem" }}>
                <h1 style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.8rem" }}>
                    Punter Dashboard
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    Welcome back, {user?.name.split(" ")[0] || "Punter"}! Ready to share your predictions?
                </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", marginBottom: "3.2rem" }} className="stats-grid">
                <button
                    onClick={() => router.push("/dashboard/punter/new-prediction")}
                    style={{
                        background: "linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)",
                        border: "none",
                        borderRadius: "1.2rem",
                        padding: "3.2rem",
                        cursor: "pointer",
                        textAlign: "left",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(255, 107, 0, 0.25)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 30px rgba(255, 107, 0, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 107, 0, 0.25)";
                    }}
                >
                    <div style={{ fontSize: "4rem", marginBottom: "1.2rem" }}>🎯</div>
                    <h3 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.8rem" }}>
                        Post Prediction
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.5 }}>
                        Share your expert betting tips
                    </p>
                </button>

                <button
                    onClick={() => router.push("/dashboard/punter/bet-codes")}
                    style={{
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        border: "none",
                        borderRadius: "1.2rem",
                        padding: "3.2rem",
                        cursor: "pointer",
                        textAlign: "left",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(34, 197, 94, 0.25)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 30px rgba(34, 197, 94, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(34, 197, 94, 0.25)";
                    }}
                >
                    <div style={{ fontSize: "4rem", marginBottom: "1.2rem" }}>🎫</div>
                    <h3 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.8rem" }}>
                        Share Bet Codes
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.5 }}>
                        Share booking codes & slips
                    </p>
                </button>

                <button
                    onClick={() => router.push("/admin-dashboard/new-post")}
                    style={{
                        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
                        border: "none",
                        borderRadius: "1.2rem",
                        padding: "3.2rem",
                        cursor: "pointer",
                        textAlign: "left",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
                    }}
                >
                    <div style={{ fontSize: "4rem", marginBottom: "1.2rem" }}>✍️</div>
                    <h3 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.8rem" }}>
                        Write Article
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5 }}>
                        Create blog posts & analysis
                    </p>
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem", marginBottom: "3.2rem" }} className="admin-stats-grid">
                {[
                    { label: "Total Predictions", value: stats.totalPredictions, icon: "🎯", color: "#ff6b00" },
                    { label: "Win Rate", value: `${winRate}%`, icon: "📈", color: "#22c55e" },
                    { label: "Pending", value: stats.pendingPredictions, icon: "⏳", color: "#f59e0b" },
                    { label: "Blog Posts", value: stats.totalPosts, icon: "📝", color: "#1a1f71" },
                ].map((stat, i) => (
                    <div key={i} style={{
                        backgroundColor: "#fff",
                        borderRadius: "1rem",
                        padding: "2.4rem",
                        border: "1px solid #e8ebed",
                        position: "relative",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute",
                            top: "-2rem",
                            right: "-2rem",
                            fontSize: "8rem",
                            opacity: 0.05,
                        }}>{stat.icon}</div>
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.2rem" }}>
                                {stat.label}
                            </p>
                            <p style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: stat.color, margin: 0, lineHeight: 1 }}>
                                {loading ? "..." : stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", padding: "2.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        Recent Predictions
                    </h2>
                    <a href="/dashboard/punter/predictions" style={{ fontFamily: f, fontSize: "1.3rem", color: "#ff6b00", fontWeight: 700, textDecoration: "none" }}>
                        View all →
                    </a>
                </div>

                {recentTips.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                        <div style={{ fontSize: "6rem", marginBottom: "1.6rem", opacity: 0.3 }}>🎯</div>
                        <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", marginBottom: "2rem" }}>
                            No predictions yet. Start sharing your expert tips!
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/punter/new-prediction")}
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
                            Post Your First Prediction
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        {recentTips.map((tip) => (
                            <div
                                key={tip.id}
                                style={{
                                    padding: "1.6rem",
                                    backgroundColor: "#f9fafb",
                                    borderRadius: "0.8rem",
                                    border: "1px solid #e8ebed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "1.6rem",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "0.8rem" }}>
                                        <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                            {tip.home} vs {tip.away}
                                        </span>
                                        <span style={{
                                            padding: "0.4rem 0.8rem",
                                            backgroundColor: tip.result === "won" ? "#dcfce7" : tip.result === "lost" ? "#fee2e2" : "#fef3c7",
                                            color: tip.result === "won" ? "#16a34a" : tip.result === "lost" ? "#dc2626" : "#ca8a04",
                                            borderRadius: "0.4rem",
                                            fontFamily: f,
                                            fontSize: "1.1rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                        }}>
                                            {tip.result}
                                        </span>
                                    </div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem" }}>
                                        {tip.league} • {tip.outcome}
                                    </p>
                                    <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", margin: 0 }}>
                                        Confidence: {tip.confidence}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "0.8rem" }}>
                                    <button
                                        onClick={() => router.push(`/dashboard/punter/predictions/edit/${tip.id}`)}
                                        style={{
                                            padding: "0.8rem 1.6rem",
                                            backgroundColor: "#fff",
                                            border: "1px solid #e8ebed",
                                            borderRadius: "0.6rem",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 600,
                                            color: "#68676d",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <a
                                        href={`/predictions/${tip.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: "0.8rem 1.6rem",
                                            backgroundColor: "#ff6b00",
                                            border: "none",
                                            borderRadius: "0.6rem",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 600,
                                            color: "#fff",
                                            textDecoration: "none",
                                            display: "inline-block",
                                        }}
                                    >
                                        View
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
