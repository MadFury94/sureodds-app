"use client";
import { useRef, useState } from "react";
import type { MatchCard, StandingRow } from "@/lib/footballdata";
import { colors, fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const OTHER_LEAGUES = [
    { name: "Premier League", href: "/category/epl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "La Liga", href: "/category/la-liga", flag: "🇪🇸" },
    { name: "Champions League", href: "/category/ucl", flag: "⭐" },
    { name: "AFCON", href: "/category/afcon", flag: "🌍" },
    { name: "Serie A", href: "#", flag: "🇮🇹" },
    { name: "Bundesliga", href: "#", flag: "🇩🇪" },
    { name: "Ligue 1", href: "#", flag: "🇫🇷" },
];

// ── Scores Ticker ─────────────────────────────────────────────────────────
interface TickerProps {
    recent: MatchCard[];
    upcoming: MatchCard[];
    color: string;
}

export function CategoryScoresTicker({ recent, upcoming, color }: TickerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const all = [...recent, ...upcoming];

    function onScroll() {
        const el = scrollRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 0);
        setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }

    const scroll = (dir: 1 | -1) =>
        scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

    const arrowStyle: React.CSSProperties = {
        width: "3.2rem", height: "3.2rem", borderRadius: "50%",
        border: "1px solid #ddd", backgroundColor: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0, pointerEvents: "all",
    };

    if (all.length === 0) return null;

    return (
        <div style={{ backgroundColor: "#f2f5f6", borderBottom: "1px solid #ddd" }}>
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", position: "relative" }}>
                <div
                    ref={scrollRef}
                    onScroll={onScroll}
                    className="scrollbar-hide"
                    style={{ overflowX: "auto", padding: "0.8rem 5.6rem 0.8rem 1.2rem" }}
                >
                    <div style={{ display: "flex", gap: "0.8rem", width: "max-content" }}>
                        {all.map((m) => {
                            const isNS = m.status === "NS";
                            const isLive = m.status === "LIVE";
                            const isFT = m.status === "FT";
                            return (
                                <div key={m.id} style={{
                                    display: "flex", flexDirection: "column", gap: "0.3rem",
                                    backgroundColor: "#fff", border: "1px solid #e0e0e0",
                                    borderRadius: "0.4rem", padding: "0.6rem 1rem",
                                    minWidth: "15rem",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                                        <span style={{ fontFamily: f, fontSize: "1rem", color: "#99989f", textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "9rem" }}>
                                            {m.competition}
                                        </span>
                                        {isLive ? (
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                                <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", backgroundColor: "#e9173d", display: "inline-block", animation: "livePulse 1.6s ease-in-out infinite" }} />
                                                <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#e9173d" }}>LIVE</span>
                                            </span>
                                        ) : (
                                            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 600, color: isFT ? "#68676d" : color, flexShrink: 0 }}>
                                                {isFT ? "FT" : m.status === "PP" ? "PP" : m.time}
                                            </span>
                                        )}
                                    </div>
                                    {[
                                        { name: m.home, crest: m.homeCrest, score: m.homeScore },
                                        { name: m.away, crest: m.awayCrest, score: m.awayScore },
                                    ].map((t, ti) => (
                                        <div key={ti} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.4rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                                                {t.crest && (
                                                    <img src={t.crest} alt="" width={14} height={14} style={{ width: "1.4rem", height: "1.4rem", objectFit: "contain", flexShrink: 0 }} />
                                                )}
                                                <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                                            </div>
                                            {!isNS && t.score !== null && (
                                                <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", flexShrink: 0 }}>{t.score}</span>
                                            )}
                                        </div>
                                    ))}
                                    {isNS && (
                                        <div style={{ marginTop: "0.2rem", textAlign: "center" }}>
                                            <span style={{ fontFamily: f, fontSize: "1rem", color: "#99989f" }}>{m.date}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {canLeft && (
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "7rem", background: "linear-gradient(to left, transparent, #f2f5f6 65%)", display: "flex", alignItems: "center", paddingLeft: "1.2rem", pointerEvents: "none" }}>
                        <button onClick={() => scroll(-1)} style={arrowStyle}>
                            <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M7 1L1 7l6 6" /></svg>
                        </button>
                    </div>
                )}
                {canRight && (
                    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "7rem", background: "linear-gradient(to right, transparent, #f2f5f6 65%)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "1.2rem", pointerEvents: "none" }}>
                        <button onClick={() => scroll(1)} style={arrowStyle}>
                            <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M1 1l6 6-6 6" /></svg>
                        </button>
                    </div>
                )}
            </div>
            <style>{`@keyframes livePulse{0%,100%{box-shadow:0 0 0 0 rgba(233,23,61,.5)}50%{box-shadow:0 0 0 5px rgba(233,23,61,0)}}`}</style>
        </div>
    );
}

// ── Fixtures Row ──────────────────────────────────────────────────────────
interface FixturesProps {
    fixtures: MatchCard[];
    color: string;
    label: string;
}

export function FixturesRow({ fixtures, color, label }: FixturesProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    function onScroll() {
        const el = scrollRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 0);
        setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }

    const scroll = (dir: 1 | -1) =>
        scrollRef.current?.scrollBy({ left: dir * 500, behavior: "smooth" });

    const arrowStyle: React.CSSProperties = {
        width: "3.6rem", height: "3.6rem", borderRadius: "50%",
        border: "1px solid #ddd", backgroundColor: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
    };

    if (fixtures.length === 0) return null;

    return (
        <section style={{ padding: "4rem 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Upcoming Fixtures
                    </span>
                    <span style={{
                        display: "inline-flex", padding: "0.3rem 0.8rem", borderRadius: "0.2rem",
                        backgroundColor: color, fontFamily: f, fontSize: "1rem",
                        fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>{label}</span>
                </div>
                <div style={{ display: "flex", gap: "0.8rem" }}>
                    <button onClick={() => scroll(-1)} disabled={!canLeft} style={{ ...arrowStyle, opacity: canLeft ? 1 : 0.35 }} aria-label="Previous">
                        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M7 1L1 7l6 6" /></svg>
                    </button>
                    <button onClick={() => scroll(1)} disabled={!canRight} style={{ ...arrowStyle, opacity: canRight ? 1 : 0.35 }} aria-label="Next">
                        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M1 1l6 6-6 6" /></svg>
                    </button>
                </div>
            </div>

            <div ref={scrollRef} onScroll={onScroll} className="scrollbar-hide" style={{ overflowX: "auto" }}>
                <div style={{ display: "flex", gap: "1.6rem", width: "max-content" }}>
                    {fixtures.map((m) => (
                        <div key={m.id} style={{
                            width: "24rem", flexShrink: 0,
                            backgroundColor: "#fff", borderRadius: "1rem",
                            border: "1px solid #e8ebed", overflow: "hidden",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        }}>
                            <div style={{ height: "0.4rem", backgroundColor: color }} />
                            <div style={{ padding: "1.6rem" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                                    <span style={{
                                        fontFamily: f, fontSize: "1.05rem", fontWeight: 700,
                                        color: "#fff", backgroundColor: color,
                                        padding: "0.25rem 0.7rem", borderRadius: "0.3rem",
                                        textTransform: "uppercase", letterSpacing: "0.06em",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "13rem",
                                    }}>{m.competition}</span>
                                    <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", flexShrink: 0 }}>{m.date}</span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "1.4rem" }}>
                                    {/* Home */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                                        <div style={{
                                            width: "4.4rem", height: "4.4rem", borderRadius: "50%",
                                            backgroundColor: "#f2f5f6", border: "2px solid #e8ebed",
                                            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                                        }}>
                                            {m.homeCrest
                                                ? <img src={m.homeCrest} alt={m.home} width={32} height={32} style={{ width: "3.2rem", height: "3.2rem", objectFit: "contain" }} />
                                                : <span style={{ fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>{m.home.slice(0, 2).toUpperCase()}</span>
                                            }
                                        </div>
                                        <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center", lineHeight: 1.2 }}>{m.home}</span>
                                    </div>

                                    {/* VS + time */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                                        <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#e8ebed" }}>VS</span>
                                        <span style={{ fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: color }}>{m.time}</span>
                                    </div>

                                    {/* Away */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                                        <div style={{
                                            width: "4.4rem", height: "4.4rem", borderRadius: "50%",
                                            backgroundColor: "#f2f5f6", border: "2px solid #e8ebed",
                                            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                                        }}>
                                            {m.awayCrest
                                                ? <img src={m.awayCrest} alt={m.away} width={32} height={32} style={{ width: "3.2rem", height: "3.2rem", objectFit: "contain" }} />
                                                : <span style={{ fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>{m.away.slice(0, 2).toUpperCase()}</span>
                                            }
                                        </div>
                                        <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center", lineHeight: 1.2 }}>{m.away}</span>
                                    </div>
                                </div>

                                {m.venue && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1rem", borderTop: "1px solid #f2f5f6" }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#99989f" strokeWidth="2">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                            <circle cx="12" cy="9" r="2.5" />
                                        </svg>
                                        <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>{m.venue}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── Standings Sidebar ─────────────────────────────────────────────────────
interface StandingsProps {
    rows: StandingRow[];
    color: string;
}

function StandingsSidebar({ rows, color }: StandingsProps) {
    if (rows.length === 0) return null;

    return (
        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
            <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #e8ebed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Standings</span>
                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>2024/25</span>
            </div>

            {/* Header row */}
            <div className="standings-table" style={{ padding: "0.6rem 1.4rem", backgroundColor: "#f9fafb", borderBottom: "1px solid #f0f0f0" }}>
                {["#", "Club", "P", "W", "GD", "Pts"].map(h => (
                    <span key={h} style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "Club" ? "left" : "center" }}>{h}</span>
                ))}
            </div>

            {rows.map((row, i) => {
                const isTop4 = row.pos <= 4;
                return (
                    <div key={row.pos} className="standings-table" style={{
                        padding: "0.8rem 1.4rem",
                        borderBottom: i < rows.length - 1 ? "1px solid #f5f5f5" : "none",
                        backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                        borderLeft: `3px solid ${isTop4 ? color : "transparent"}`,
                    }}>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: isTop4 ? color : "#99989f", textAlign: "center", alignSelf: "center" }}>{row.pos}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", alignSelf: "center", minWidth: 0 }}>
                            {row.crest && (
                                <img src={row.crest} alt="" width={16} height={16} style={{ width: "1.6rem", height: "1.6rem", objectFit: "contain", flexShrink: 0 }} />
                            )}
                            <span style={{ fontFamily: f, fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.team}</span>
                        </div>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", textAlign: "center", alignSelf: "center" }}>{row.played}</span>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", textAlign: "center", alignSelf: "center" }}>{row.won}</span>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 600, textAlign: "center", alignSelf: "center", color: row.gd > 0 ? "#1a6b3c" : row.gd < 0 ? "#e9173d" : "#68676d" }}>
                            {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </span>
                        <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center", alignSelf: "center" }}>{row.pts}</span>
                    </div>
                );
            })}

            <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "1rem", height: "1rem", borderRadius: "2px", backgroundColor: color, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>Top 4 qualify for UCL</span>
            </div>
        </div>
    );
}

// ── Other Leagues Sidebar (non-league pages) ──────────────────────────────
interface OtherLeaguesProps {
    sport: string;
    recent: MatchCard[];
}

function OtherLeaguesSidebar({ sport, recent }: OtherLeaguesProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* League links */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #e8ebed" }}>
                    <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" }}>League Standings</span>
                </div>
                {OTHER_LEAGUES.filter(l => l.href !== `/category/${sport}`).map((league, i, arr) => (
                    <a key={league.name} href={league.href} style={{
                        display: "flex", alignItems: "center", gap: "1.2rem",
                        padding: "1.1rem 1.6rem",
                        borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none",
                        textDecoration: "none",
                    }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>{league.flag}</span>
                        <span style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 600, color: "#1a1a1a", flex: 1 }}>{league.name}</span>
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="#99989f" strokeWidth="1.5"><path d="M1 1l4 4-4 4" /></svg>
                    </a>
                ))}
            </div>

            {/* Recent scores */}
            {recent.length > 0 && (
                <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                    <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #e8ebed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Scores</span>
                        <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>Latest</span>
                    </div>
                    {recent.slice(0, 6).map((m, i) => (
                        <div key={m.id} style={{ padding: "1rem 1.6rem", borderBottom: i < Math.min(recent.length, 6) - 1 ? "1px solid #f5f5f5" : "none" }}>
                            <span style={{ fontFamily: f, fontSize: "1rem", color: "#99989f", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "0.4rem" }}>{m.competition}</span>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, minWidth: 0 }}>
                                    {m.homeCrest && <img src={m.homeCrest} alt="" width={14} height={14} style={{ width: "1.4rem", height: "1.4rem", objectFit: "contain", flexShrink: 0 }} />}
                                    <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.home}</span>
                                </div>
                                <span style={{ fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", padding: "0 0.8rem", flexShrink: 0 }}>{m.homeScore} – {m.awayScore}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
                                    <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.away}</span>
                                    {m.awayCrest && <img src={m.awayCrest} alt="" width={14} height={14} style={{ width: "1.4rem", height: "1.4rem", objectFit: "contain", flexShrink: 0 }} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Sidebar Export ───────────────────────────────────────────────────
interface SidebarProps {
    sport: string;
    color: string;
    standings: StandingRow[];
    recent: MatchCard[];
}

export default function CategorySidebar({ sport, color, standings, recent }: SidebarProps) {
    const isLeague = standings.length > 0;
    return (
        <aside style={{ position: "sticky", top: "9rem" }}>
            {isLeague
                ? <StandingsSidebar rows={standings} color={color} />
                : <OtherLeaguesSidebar sport={sport} recent={recent} />
            }
        </aside>
    );
}
