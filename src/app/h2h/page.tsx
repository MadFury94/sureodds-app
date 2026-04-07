"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { fonts, colors } from "@/lib/config";

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
    aggregatedWinnerCode?: number;
}

export default function HeadToHeadPage() {
    const [eventId, setEventId] = useState("xdbsZdb");
    const [h2hData, setH2hData] = useState<{ events: H2HEvent[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchH2H = async () => {
        if (!eventId.trim()) {
            setError("Please enter an event ID");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/sports/h2h?eventId=${eventId}`);
            const data = await response.json();

            if (response.ok) {
                setH2hData(data);
            } else {
                setError(data.error || "Failed to fetch data");
            }
        } catch (err) {
            setError("Failed to fetch head-to-head data");
        } finally {
            setLoading(false);
        }
    };

    const events = h2hData?.events || [];
    const homeWins = events.filter(e => e.winnerCode === 1 || e.aggregatedWinnerCode === 1).length;
    const awayWins = events.filter(e => e.winnerCode === 2 || e.aggregatedWinnerCode === 2).length;
    const draws = events.filter(e => e.winnerCode === 0 && !e.aggregatedWinnerCode).length;

    const homeTeam = events[0]?.homeTeam.name || "Team A";
    const awayTeam = events[0]?.awayTeam.name || "Team B";

    // Calculate goals
    const totalHomeGoals = events.reduce((sum, e) => sum + e.homeScore.display, 0);
    const totalAwayGoals = events.reduce((sum, e) => sum + e.awayScore.display, 0);
    const avgHomeGoals = events.length > 0 ? (totalHomeGoals / events.length).toFixed(1) : "0";
    const avgAwayGoals = events.length > 0 ? (totalAwayGoals / events.length).toFixed(1) : "0";

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <PageHeader
                title="Head-to-Head Analysis"
                subtitle="Compare historical matchups between teams to make informed betting decisions"
                image="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80"
                badge="H2H Stats"
                badgeColor={colors.primary}
            />

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>
                {/* Search Section */}
                <div style={{
                    backgroundColor: "#f9fafb",
                    borderRadius: "1.2rem",
                    padding: "3.2rem",
                    marginBottom: "4rem",
                    border: "1px solid #e8ebed",
                }}>
                    <h2 style={{
                        fontFamily: fd,
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        marginBottom: "1.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                    }}>
                        Search Head-to-Head
                    </h2>

                    <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
                        <input
                            type="text"
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            placeholder="Enter event ID (e.g., xdbsZdb)"
                            style={{
                                flex: 1,
                                minWidth: "30rem",
                                padding: "1.4rem 1.6rem",
                                border: "2px solid #e8ebed",
                                borderRadius: "0.8rem",
                                fontFamily: f,
                                fontSize: "1.4rem",
                                color: "#1a1a1a",
                            }}
                            onKeyPress={(e) => e.key === "Enter" && fetchH2H()}
                        />
                        <button
                            onClick={fetchH2H}
                            disabled={loading}
                            style={{
                                padding: "1.4rem 3.2rem",
                                backgroundColor: colors.primary,
                                border: "none",
                                borderRadius: "0.8rem",
                                fontFamily: fd,
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                color: "#fff",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {loading ? "Loading..." : "Analyze"}
                        </button>
                    </div>

                    <p style={{
                        fontFamily: f,
                        fontSize: "1.2rem",
                        color: "#99989f",
                        marginTop: "1.2rem",
                    }}>
                        💡 Tip: Find event IDs from upcoming fixtures on league pages
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: "2rem",
                        backgroundColor: "#fff7f0",
                        border: "1px solid #fed7aa",
                        borderRadius: "1rem",
                        marginBottom: "3.2rem",
                    }}>
                        <span style={{ fontFamily: f, fontSize: "1.4rem", color: "#ff6b00" }}>
                            {error}
                        </span>
                    </div>
                )}

                {h2hData && events.length > 0 && (
                    <>
                        {/* Team Header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto 1fr",
                            gap: "2rem",
                            alignItems: "center",
                            marginBottom: "4rem",
                            padding: "3.2rem",
                            backgroundColor: "#f9fafb",
                            borderRadius: "1.2rem",
                        }}>
                            <div style={{ textAlign: "center" }}>
                                <h3 style={{
                                    fontFamily: fd,
                                    fontSize: "2.4rem",
                                    fontWeight: 700,
                                    color: "#1a1a1a",
                                    marginBottom: "0.8rem",
                                }}>
                                    {homeTeam}
                                </h3>
                                <div style={{
                                    fontFamily: fd,
                                    fontSize: "4rem",
                                    fontWeight: 700,
                                    color: colors.primary,
                                }}>
                                    {homeWins}
                                </div>
                                <div style={{
                                    fontFamily: f,
                                    fontSize: "1.2rem",
                                    color: "#99989f",
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
                                gap: "0.8rem",
                            }}>
                                <div style={{
                                    fontFamily: fd,
                                    fontSize: "1.6rem",
                                    fontWeight: 700,
                                    color: "#68676d",
                                    textTransform: "uppercase",
                                }}>
                                    VS
                                </div>
                                <div style={{
                                    padding: "0.8rem 1.6rem",
                                    backgroundColor: "#fff",
                                    borderRadius: "2rem",
                                    border: "2px solid #e8ebed",
                                }}>
                                    <span style={{
                                        fontFamily: fd,
                                        fontSize: "2rem",
                                        fontWeight: 700,
                                        color: "#68676d",
                                    }}>
                                        {draws}
                                    </span>
                                    <span style={{
                                        fontFamily: f,
                                        fontSize: "1.2rem",
                                        color: "#99989f",
                                        marginLeft: "0.6rem",
                                    }}>
                                        Draws
                                    </span>
                                </div>
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <h3 style={{
                                    fontFamily: fd,
                                    fontSize: "2.4rem",
                                    fontWeight: 700,
                                    color: "#1a1a1a",
                                    marginBottom: "0.8rem",
                                }}>
                                    {awayTeam}
                                </h3>
                                <div style={{
                                    fontFamily: fd,
                                    fontSize: "4rem",
                                    fontWeight: 700,
                                    color: colors.primary,
                                }}>
                                    {awayWins}
                                </div>
                                <div style={{
                                    fontFamily: f,
                                    fontSize: "1.2rem",
                                    color: "#99989f",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}>
                                    Wins
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))",
                            gap: "2rem",
                            marginBottom: "4rem",
                        }}>
                            {[
                                { label: "Total Meetings", value: events.length, icon: "📊" },
                                { label: "Avg Goals (Home)", value: avgHomeGoals, icon: "⚽" },
                                { label: "Avg Goals (Away)", value: avgAwayGoals, icon: "⚽" },
                                { label: "Total Goals", value: totalHomeGoals + totalAwayGoals, icon: "🎯" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    style={{
                                        padding: "2.4rem",
                                        backgroundColor: "#fff",
                                        border: "1px solid #e8ebed",
                                        borderRadius: "1rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{
                                        fontFamily: fd,
                                        fontSize: "3.2rem",
                                        fontWeight: 700,
                                        color: "#1a1a1a",
                                        marginBottom: "0.4rem",
                                    }}>
                                        {stat.value}
                                    </div>
                                    <div style={{
                                        fontFamily: f,
                                        fontSize: "1.2rem",
                                        color: "#99989f",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Match History */}
                        <div>
                            <h3 style={{
                                fontFamily: fd,
                                fontSize: "2rem",
                                fontWeight: 700,
                                color: "#1a1a1a",
                                marginBottom: "2rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.03em",
                            }}>
                                Match History
                            </h3>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                {events.map((event, i) => {
                                    const homeWon = event.winnerCode === 1 || event.aggregatedWinnerCode === 1;
                                    const awayWon = event.winnerCode === 2 || event.aggregatedWinnerCode === 2;
                                    const isDraw = event.winnerCode === 0 && !event.aggregatedWinnerCode;

                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                padding: "2rem",
                                                backgroundColor: "#fff",
                                                border: "1px solid #e8ebed",
                                                borderRadius: "1rem",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                            }}
                                        >
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "1.2rem",
                                            }}>
                                                <div>
                                                    <span style={{
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        fontWeight: 700,
                                                        color: colors.primary,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.05em",
                                                    }}>
                                                        {event.tournament.name}
                                                    </span>
                                                    <span style={{
                                                        fontFamily: f,
                                                        fontSize: "1.1rem",
                                                        color: "#99989f",
                                                        marginLeft: "1rem",
                                                    }}>
                                                        {event.season.name}
                                                    </span>
                                                </div>
                                                <span style={{
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    color: "#99989f",
                                                }}>
                                                    {new Date(event.startTimestamp * 1000).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr auto 1fr",
                                                gap: "2rem",
                                                alignItems: "center",
                                            }}>
                                                <div style={{
                                                    textAlign: "right",
                                                    fontFamily: f,
                                                    fontSize: "1.6rem",
                                                    fontWeight: homeWon ? 700 : 600,
                                                    color: homeWon ? colors.primary : "#1a1a1a",
                                                }}>
                                                    {event.homeTeam.name}
                                                </div>

                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "1.2rem",
                                                    padding: "1rem 2rem",
                                                    backgroundColor: isDraw ? "#f9fafb" : homeWon ? `${colors.primary}15` : `${colors.primary}08`,
                                                    borderRadius: "0.8rem",
                                                }}>
                                                    <span style={{
                                                        fontFamily: fd,
                                                        fontSize: "2.4rem",
                                                        fontWeight: 700,
                                                        color: homeWon ? colors.primary : "#1a1a1a",
                                                    }}>
                                                        {event.homeScore.display}
                                                    </span>
                                                    <span style={{
                                                        fontFamily: f,
                                                        fontSize: "1.6rem",
                                                        color: "#99989f",
                                                    }}>
                                                        -
                                                    </span>
                                                    <span style={{
                                                        fontFamily: fd,
                                                        fontSize: "2.4rem",
                                                        fontWeight: 700,
                                                        color: awayWon ? colors.primary : "#1a1a1a",
                                                    }}>
                                                        {event.awayScore.display}
                                                    </span>
                                                </div>

                                                <div style={{
                                                    textAlign: "left",
                                                    fontFamily: f,
                                                    fontSize: "1.6rem",
                                                    fontWeight: awayWon ? 700 : 600,
                                                    color: awayWon ? colors.primary : "#1a1a1a",
                                                }}>
                                                    {event.awayTeam.name}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {h2hData && events.length === 0 && (
                    <div style={{
                        padding: "6rem 2rem",
                        textAlign: "center",
                        backgroundColor: "#f9fafb",
                        borderRadius: "1.2rem",
                    }}>
                        <div style={{ fontSize: "6rem", marginBottom: "1.6rem" }}>🔍</div>
                        <h3 style={{
                            fontFamily: fd,
                            fontSize: "2.4rem",
                            fontWeight: 700,
                            color: "#1a1a1a",
                            marginBottom: "0.8rem",
                        }}>
                            No Previous Meetings Found
                        </h3>
                        <p style={{
                            fontFamily: f,
                            fontSize: "1.4rem",
                            color: "#68676d",
                        }}>
                            These teams haven't faced each other in recent history
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
