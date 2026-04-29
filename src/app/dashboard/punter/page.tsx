"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Stats {
    totalBetCodes: number;
    totalPosts: number;
    activeBetCodes: number;
    wonBetCodes: number;
    lostBetCodes: number;
}

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

export default function PunterDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [stats, setStats] = useState<Stats>({ totalBetCodes: 0, totalPosts: 0, activeBetCodes: 0, wonBetCodes: 0, lostBetCodes: 0 });
    const [recentBetCodes, setRecentBetCodes] = useState<BetCode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/auth/me").then(r => r.json()),
            fetch("/api/bet-codes").then(r => r.json()),
        ]).then(([userData, betCodesData]) => {
            if (userData.user) {
                if (userData.user.role !== "punter") {
                    router.push("/dashboard");
                    return;
                }
                setUser(userData.user);
            }

            const betCodes = betCodesData.betCodes || [];

            setStats({
                totalBetCodes: betCodes.length,
                totalPosts: 0,
                activeBetCodes: betCodes.filter((b: any) => b.status === "active").length,
                wonBetCodes: betCodes.filter((b: any) => b.status === "won").length,
                lostBetCodes: betCodes.filter((b: any) => b.status === "lost").length,
            });

            // Get the 5 most recent bet codes
            setRecentBetCodes(betCodes.slice(0, 5));
            setLoading(false);
        });
    }, [router, searchParams]);

    const winRate = stats.totalBetCodes > 0
        ? Math.round((stats.wonBetCodes / (stats.wonBetCodes + stats.lostBetCodes)) * 100) || 0
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3.2rem" }} className="stats-grid">
                <button
                    onClick={() => router.push("/dashboard/punter/bet-codes")}
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
                    <div style={{ fontSize: "4rem", marginBottom: "1.2rem" }}>🎫</div>
                    <h3 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.8rem" }}>
                        Share Bet Codes
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.5 }}>
                        Share booking codes & bet slips
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
                    { label: "Total Bet Codes", value: stats.totalBetCodes, icon: "🎫", color: "#ff6b00" },
                    { label: "Win Rate", value: `${winRate}%`, icon: "📈", color: "#22c55e" },
                    { label: "Active Codes", value: stats.activeBetCodes, icon: "⏳", color: "#f59e0b" },
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
                        Recent Bet Codes
                    </h2>
                    <a href="/dashboard/punter/bet-codes" style={{ fontFamily: f, fontSize: "1.3rem", color: "#ff6b00", fontWeight: 700, textDecoration: "none" }}>
                        View all →
                    </a>
                </div>

                {recentBetCodes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                        <div style={{ fontSize: "6rem", marginBottom: "1.6rem", opacity: 0.3 }}>🎫</div>
                        <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", marginBottom: "2rem" }}>
                            No bet codes shared yet. Start sharing booking codes!
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/punter/bet-codes")}
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
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(30rem, 1fr))", gap: "1.6rem" }}>
                        {recentBetCodes.map((betCode) => (
                            <div
                                key={betCode.id}
                                style={{
                                    padding: "1.6rem",
                                    backgroundColor: "#f9fafb",
                                    borderRadius: "0.8rem",
                                    border: "2px solid #e8ebed",
                                    position: "relative",
                                }}
                            >
                                {/* Status Badge */}
                                <div style={{
                                    position: "absolute",
                                    top: "1.2rem",
                                    right: "1.2rem",
                                    padding: "0.4rem 1rem",
                                    borderRadius: "10rem",
                                    backgroundColor: betCode.status === "active" ? "#f0fdf4" : betCode.status === "won" ? "#dcfce7" : betCode.status === "lost" ? "#fee2e2" : "#f3f4f6",
                                    border: `1px solid ${betCode.status === "active" ? "#86efac" : betCode.status === "won" ? "#22c55e" : betCode.status === "lost" ? "#fca5a5" : "#d1d5db"}`,
                                    fontFamily: f,
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: betCode.status === "active" ? "#16a34a" : betCode.status === "won" ? "#15803d" : betCode.status === "lost" ? "#dc2626" : "#6b7280",
                                    textTransform: "uppercase",
                                }}>
                                    {betCode.status}
                                </div>

                                {/* Bookmaker */}
                                <div style={{ marginBottom: "1.2rem", paddingRight: "6rem" }}>
                                    <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>
                                        {betCode.bookmaker}
                                    </p>
                                    <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", margin: 0 }}>
                                        {new Date(betCode.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                {/* Code */}
                                {betCode.code && (
                                    <div style={{ backgroundColor: "#fff", borderRadius: "0.6rem", padding: "1.2rem", marginBottom: "1.2rem", border: "1px solid #e8ebed" }}>
                                        <p style={{ fontFamily: f, fontSize: "1rem", color: "#68676d", margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                            Code
                                        </p>
                                        <p style={{ fontFamily: "monospace", fontSize: "1.6rem", fontWeight: 700, color: "#ff6b00", margin: 0, letterSpacing: "0.1em" }}>
                                            {betCode.code}
                                        </p>
                                    </div>
                                )}

                                {/* Description */}
                                {betCode.description && (
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#3d3c41", margin: "0 0 1.2rem", lineHeight: 1.5 }}>
                                        {betCode.description.length > 80 ? betCode.description.substring(0, 80) + "..." : betCode.description}
                                    </p>
                                )}

                                {/* Odds */}
                                {betCode.odds && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                        <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>Odds:</span>
                                        <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                            {betCode.odds}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
