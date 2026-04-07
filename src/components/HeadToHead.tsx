"use client";
import { useState, useEffect } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface H2HEvent {
    homeTeam: { name: string; nameCode: string };
    awayTeam: { name: string; nameCode: string };
    homeScore: { display: number };
    awayScore: { display: number };
    tournament: { name: string };
    season: { name: string };
    status: { description: string };
    startTimestamp: number;
    winnerCode: number;
}

interface Props {
    eventId: string;
    homeTeam: string;
    awayTeam: string;
    color: string;
}

export default function HeadToHead({ eventId, homeTeam, awayTeam, color }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [h2hData, setH2hData] = useState<{ events: H2HEvent[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (expanded && !h2hData && !loading) {
            setLoading(true);
            fetch(`/api/sports/h2h?eventId=${eventId}`)
                .then(r => r.json())
                .then(data => {
                    setH2hData(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError(true);
                    setLoading(false);
                });
        }
    }, [expanded, eventId, h2hData, loading]);

    const events = h2hData?.events || [];
    const homeWins = events.filter(e => e.winnerCode === 1).length;
    const awayWins = events.filter(e => e.winnerCode === 2).length;
    const draws = events.filter(e => e.winnerCode === 0).length;

    return (
        <div style={{ marginTop: "1.2rem", borderTop: "1px solid #f2f5f6", paddingTop: "1.2rem" }}>
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.8rem 0",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>⚔️</span>
                    <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: color }}>
                        Head-to-Head History
                    </span>
                </div>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    style={{
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                    }}
                >
                    <path d="M2 4l4 4 4-4" />
                </svg>
            </button>

            {expanded && (
                <div style={{ marginTop: "1rem", animation: "slideDown 0.3s ease-out" }}>
                    {loading && (
                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <div style={{
                                width: "2.4rem",
                                height: "2.4rem",
                                border: `3px solid ${color}33`,
                                borderTop: `3px solid ${color}`,
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                                margin: "0 auto",
                            }} />
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: "1.6rem",
                            backgroundColor: "#fff7f0",
                            border: "1px solid #fed7aa",
                            borderRadius: "0.6rem",
                            textAlign: "center",
                        }}>
                            <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>
                                Unable to load head-to-head data
                            </span>
                        </div>
                    )}

                    {h2hData && events.length === 0 && (
                        <div style={{
                            padding: "1.6rem",
                            backgroundColor: "#f9fafb",
                            borderRadius: "0.6rem",
                            textAlign: "center",
                        }}>
                            <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>
                                No previous meetings found
                            </span>
                        </div>
                    )}

                    {h2hData && events.length > 0 && (
                        <>
                            {/* Stats Summary */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr auto 1fr",
                                gap: "1.2rem",
                                marginBottom: "1.6rem",
                                padding: "1.2rem",
                                backgroundColor: "#f9fafb",
                                borderRadius: "0.8rem",
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{
                                        fontFamily: fd,
                                        fontSize: "2.4rem",
                                        fontWeight: 700,
                                        color: color,
                                        lineHeight: 1,
                                    }}>
                                        {homeWins}
                                    </div>
                                    <div style={{
                                        fontFamily: f,
                                        fontSize: "1rem",
                                        color: "#99989f",
                                        marginTop: "0.4rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}>
                                        Wins
                                    </div>
                                </div>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "0 1.2rem",
                                    borderLeft: "1px solid #e8ebed",
                                    borderRight: "1px solid #e8ebed",
                                }}>
                                    <div style={{
                                        fontFamily: fd,
                                        fontSize: "2.4rem",
                                        fontWeight: 700,
                                        color: "#68676d",
                                        lineHeight: 1,
                                    }}>
                                        {draws}
                                    </div>
                                    <div style={{
                                        fontFamily: f,
                                        fontSize: "1rem",
                                        color: "#99989f",
                                        marginTop: "0.4rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}>
                                        Draws
                                    </div>
                                </div>

                                <div style={{ textAlign: "center" }}>
                                    <div style={{
                                        fontFamily: fd,
                                        fontSize: "2.4rem",
                                        fontWeight: 700,
                                        color: color,
                                        lineHeight: 1,
                                    }}>
                                        {awayWins}
                                    </div>
                                    <div style={{
                                        fontFamily: f,
                                        fontSize: "1rem",
                                        color: "#99989f",
                                        marginTop: "0.4rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}>
                                        Wins
                                    </div>
                                </div>
                            </div>

                            {/* Recent Matches */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                <div style={{
                                    fontFamily: f,
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "#68676d",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "0.4rem",
                                }}>
                                    Last {Math.min(events.length, 5)} Meetings
                                </div>

                                {events.slice(0, 5).map((event, i) => {
                                    const homeWon = event.winnerCode === 1;
                                    const awayWon = event.winnerCode === 2;
                                    const isDraw = event.winnerCode === 0;

                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                padding: "1rem",
                                                backgroundColor: "#fff",
                                                border: "1px solid #e8ebed",
                                                borderRadius: "0.6rem",
                                            }}
                                        >
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "0.6rem",
                                            }}>
                                                <span style={{
                                                    fontFamily: f,
                                                    fontSize: "1rem",
                                                    color: "#99989f",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    maxWidth: "60%",
                                                }}>
                                                    {event.tournament.name}
                                                </span>
                                                <span style={{
                                                    fontFamily: f,
                                                    fontSize: "1rem",
                                                    color: "#99989f",
                                                }}>
                                                    {new Date(event.startTimestamp * 1000).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}>
                                                <span style={{
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    fontWeight: homeWon ? 700 : 600,
                                                    color: homeWon ? color : "#1a1a1a",
                                                    flex: 1,
                                                }}>
                                                    {event.homeTeam.name}
                                                </span>

                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.8rem",
                                                    padding: "0.4rem 1.2rem",
                                                    backgroundColor: isDraw ? "#f9fafb" : homeWon ? `${color}15` : `${color}08`,
                                                    borderRadius: "0.4rem",
                                                }}>
                                                    <span style={{
                                                        fontFamily: fd,
                                                        fontSize: "1.6rem",
                                                        fontWeight: 700,
                                                        color: homeWon ? color : "#1a1a1a",
                                                    }}>
                                                        {event.homeScore.display}
                                                    </span>
                                                    <span style={{
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        color: "#99989f",
                                                    }}>
                                                        -
                                                    </span>
                                                    <span style={{
                                                        fontFamily: fd,
                                                        fontSize: "1.6rem",
                                                        fontWeight: 700,
                                                        color: awayWon ? color : "#1a1a1a",
                                                    }}>
                                                        {event.awayScore.display}
                                                    </span>
                                                </div>

                                                <span style={{
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    fontWeight: awayWon ? 700 : 600,
                                                    color: awayWon ? color : "#1a1a1a",
                                                    flex: 1,
                                                    textAlign: "right",
                                                }}>
                                                    {event.awayTeam.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
