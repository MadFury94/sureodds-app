"use client";
import { useEffect, useState } from "react";
import type { MatchCard } from "@/lib/footballdata";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function LiveMatchesTicker() {
    const [liveMatches, setLiveMatches] = useState<MatchCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLiveMatches() {
            try {
                const res = await fetch("/api/live-matches");
                if (res.ok) {
                    const data = await res.json();
                    setLiveMatches(data.matches || []);
                }
            } catch (err) {
                console.error("Failed to fetch live matches:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchLiveMatches();
        // Refresh every 30 seconds
        const interval = setInterval(fetchLiveMatches, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || liveMatches.length === 0) return null;

    return (
        <div style={{ backgroundColor: "#1a1a1a", borderBottom: "3px solid #ff6b00", padding: "0.8rem 0" }}>
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.6rem", overflowX: "auto" }} className="scrollbar-hide">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
                        <div style={{ width: "0.8rem", height: "0.8rem", borderRadius: "50%", backgroundColor: "#ff6b00", animation: "livePulse 1.6s ease-in-out infinite" }} />
                        <span style={{ fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#ff6b00", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            LIVE NOW
                        </span>
                    </div>

                    {liveMatches.map((match) => (
                        <a
                            key={match.id}
                            href={`/match/${match.id}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "0.6rem 1.2rem",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                borderRadius: "0.6rem",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                textDecoration: "none",
                                flexShrink: 0,
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                                e.currentTarget.style.borderColor = "#ff6b00";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                {match.homeCrest && (
                                    <img src={match.homeCrest} alt="" width={20} height={20} style={{ width: "2rem", height: "2rem", objectFit: "contain" }} />
                                )}
                                <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>
                                    {match.home}
                                </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0 0.4rem" }}>
                                <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>
                                    {match.homeScore}
                                </span>
                                <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>-</span>
                                <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>
                                    {match.awayScore}
                                </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>
                                    {match.away}
                                </span>
                                {match.awayCrest && (
                                    <img src={match.awayCrest} alt="" width={20} height={20} style={{ width: "2rem", height: "2rem", objectFit: "contain" }} />
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes livePulse {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.7);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(255, 107, 0, 0);
                    }
                }
            `}</style>
        </div>
    );
}
