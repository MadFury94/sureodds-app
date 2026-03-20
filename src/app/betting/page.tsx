"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { fonts, colors } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const TEAM_CRESTS: Record<string, string> = {
    "Real Madrid": "https://crests.football-data.org/86.png",
    "Man City": "https://crests.football-data.org/65.png",
    "Arsenal": "https://crests.football-data.org/57.png",
    "Chelsea": "https://crests.football-data.org/61.png",
    "Barcelona": "https://crests.football-data.org/81.png",
    "Atletico": "https://crests.football-data.org/78.png",
    "Inter Milan": "https://crests.football-data.org/108.png",
    "Juventus": "https://crests.football-data.org/109.png",
    "Liverpool": "https://crests.football-data.org/64.png",
    "Bayern Munich": "https://crests.football-data.org/5.png",
    "PSG": "https://crests.football-data.org/524.png",
    "Dortmund": "https://crests.football-data.org/4.png",
    "Tottenham": "https://crests.football-data.org/73.png",
    "Man United": "https://crests.football-data.org/66.png",
    "AC Milan": "https://crests.football-data.org/98.png",
    "Napoli": "https://crests.football-data.org/113.png",
};

const LEAGUE_ACCENT: Record<string, string> = {
    "Champions League": "#1a1f71",
    "Premier League": "#38003c",
    "La Liga": "#ff4b00",
    "Serie A": "#003399",
    "Bundesliga": "#d20515",
    "AFCON": "#009a44",
    "Europa League": "#f77f00",
};

const CONFIDENCE_COLOR: Record<string, string> = {
    Low: "#99989f", Medium: "#f59e0b", High: "#22c55e", Banker: "#ff6b00",
};

// Our specialists
const SPECIALISTS = [
    { handle: "Analyst_SO", name: "SO Analyst", avatar: "AN" },
    { handle: "TipMaster", name: "Tip Master", avatar: "TM" },
    { handle: "OddsEdge", name: "Odds Edge", avatar: "OE" },
    { handle: "ProPunter", name: "Pro Punter", avatar: "PP" },
];

interface Tip {
    id: number;
    specialist: typeof SPECIALISTS[0];
    league: string;
    home: string;
    away: string;
    outcome: string;
    odds: string;
    confidence: string;
    analysis: string;
    time: string;
    matchDate: string;
    result?: "won" | "lost" | "pending";
}

function TeamCrest({ name, size = 36 }: { name: string; size?: number }) {
    const src = TEAM_CRESTS[name];
    if (src) return <img src={src} alt={name} width={size} height={size} style={{ objectFit: "contain", flexShrink: 0 }} />;
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            backgroundColor: "#e8ebed", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <span style={{ fontFamily: f, fontSize: size * 0.35, fontWeight: 700, color: "#68676d" }}>
                {name.slice(0, 2).toUpperCase()}
            </span>
        </div>
    );
}

const RESULT_STYLE: Record<string, React.CSSProperties> = {
    won: { backgroundColor: "#f0fdf4", border: "1.5px solid #22c55e", color: "#16a34a" },
    lost: { backgroundColor: "#fff1f2", border: "1.5px solid #ff6b00", color: "#ff6b00" },
    pending: { backgroundColor: "#f2f5f6", border: "1.5px solid #e8ebed", color: "#68676d" },
};
const RESULT_LABEL: Record<string, string> = { won: "✓ Won", lost: "✗ Lost", pending: "⏳ Pending" };

export default function BettingPage() {
    const [tips, setTips] = useState<Tip[]>([]);
    const [activeLeague, setActiveLeague] = useState("All");
    const [activeConf, setActiveConf] = useState("All");

    useEffect(() => {
        fetch("/api/tips").then(r => r.json()).then(setTips).catch(() => setTips([]));
    }, []);

    const allLeagues = ["All", ...Array.from(new Set(tips.map(t => t.league)))];

    const filtered = tips.filter(t =>
        (activeLeague === "All" || t.league === activeLeague) &&
        (activeConf === "All" || t.confidence === activeConf)
    );

    const bankers = tips.filter(t => t.confidence === "Banker").length;
    const highConf = tips.filter(t => t.confidence === "High").length;
    const wonToday = tips.filter(t => t.result === "won").length;

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            <PageHeader
                title="Sure Odds"
                subtitle="Expert predictions from our specialist analysts. Updated daily."
                image="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80"
                badge="Expert Tips"
                badgeColor={colors.primary}
            />

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>

                {/* Stats bar */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1.6rem", marginBottom: "4rem",
                }} className="betting-stats-grid">
                    {[
                        { label: "Tips Today", value: tips.length, icon: "📋" },
                        { label: "Banker Tips", value: bankers, icon: "🔥" },
                        { label: "High Confidence", value: highConf, icon: "⚡" },
                        { label: "Won Today", value: wonToday, icon: "✅" },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            backgroundColor: "#f2f5f6", borderRadius: "1rem",
                            padding: "2rem", textAlign: "center",
                            border: "1.5px solid #e8ebed",
                        }}>
                            <div style={{ fontSize: "2.4rem", marginBottom: "0.4rem" }}>{stat.icon}</div>
                            <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "3rem", color: "#1a1a1a", lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.4rem" }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "2.4rem", flexWrap: "wrap", marginBottom: "3.2rem", alignItems: "flex-start" }}>
                    {/* League filter */}
                    <div>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>League</p>
                        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                            {allLeagues.map(l => (
                                <button key={l} onClick={() => setActiveLeague(l)} style={{
                                    padding: "0.6rem 1.4rem", borderRadius: "2rem",
                                    border: `2px solid ${activeLeague === l ? "#1a1a1a" : "#e8ebed"}`,
                                    backgroundColor: activeLeague === l ? "#1a1a1a" : "#fff",
                                    fontFamily: f, fontSize: "1.3rem", fontWeight: 600,
                                    color: activeLeague === l ? "#fff" : "#3d3c41",
                                    cursor: "pointer", transition: "all 0.15s",
                                }}>{l}</button>
                            ))}
                        </div>
                    </div>
                    {/* Confidence filter */}
                    <div>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Confidence</p>
                        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                            {["All", "Banker", "High", "Medium", "Low"].map(c => (
                                <button key={c} onClick={() => setActiveConf(c)} style={{
                                    padding: "0.6rem 1.4rem", borderRadius: "2rem",
                                    border: `2px solid ${activeConf === c ? (CONFIDENCE_COLOR[c] ?? "#1a1a1a") : "#e8ebed"}`,
                                    backgroundColor: activeConf === c ? (CONFIDENCE_COLOR[c] ?? "#1a1a1a") : "#fff",
                                    fontFamily: f, fontSize: "1.3rem", fontWeight: 600,
                                    color: activeConf === c ? "#fff" : "#3d3c41",
                                    cursor: "pointer", transition: "all 0.15s",
                                }}>{c}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tips grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(38rem, 1fr))", gap: "2rem" }} className="tips-grid">
                    {filtered.map(tip => {
                        const accent = LEAGUE_ACCENT[tip.league] ?? "#1a1a1a";
                        const confColor = CONFIDENCE_COLOR[tip.confidence] ?? "#68676d";
                        const resultStyle = RESULT_STYLE[tip.result ?? "pending"];
                        return (
                            <div key={tip.id} style={{
                                border: "1.5px solid #e8ebed", borderRadius: "1.2rem",
                                overflow: "hidden", backgroundColor: "#fff",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                                transition: "box-shadow 0.2s, transform 0.2s",
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
                            >
                                {/* League header strip */}
                                <div style={{
                                    backgroundColor: accent, padding: "1rem 1.6rem",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        {tip.league}
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                        <span style={{
                                            fontFamily: f, fontSize: "1.1rem", fontWeight: 700,
                                            color: confColor, backgroundColor: confColor + "22",
                                            border: `1px solid ${confColor}`,
                                            padding: "0.2rem 0.8rem", borderRadius: "10rem",
                                        }}>{tip.confidence}</span>
                                        <span style={{
                                            fontFamily: f, fontSize: "1.1rem", fontWeight: 700,
                                            padding: "0.2rem 0.8rem", borderRadius: "10rem",
                                            ...resultStyle,
                                        }}>{RESULT_LABEL[tip.result ?? "pending"]}</span>
                                    </div>
                                </div>

                                <div style={{ padding: "2rem" }}>
                                    {/* Match */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                                            <TeamCrest name={tip.home} size={40} />
                                            <span style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center" }}>{tip.home}</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", padding: "0 1rem" }}>
                                            <span style={{ fontFamily: fd, fontSize: "1.1rem", color: "#99989f" }}>VS</span>
                                            <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>{tip.matchDate}</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                                            <TeamCrest name={tip.away} size={40} />
                                            <span style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center" }}>{tip.away}</span>
                                        </div>
                                    </div>

                                    {/* Prediction + odds */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.4rem", flexWrap: "wrap" }}>
                                        <span style={{
                                            padding: "0.6rem 1.6rem", borderRadius: "10rem",
                                            backgroundColor: colors.primary,
                                            fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#fff",
                                        }}>⚽ {tip.outcome}</span>
                                        <span style={{
                                            padding: "0.6rem 1.4rem", borderRadius: "10rem",
                                            border: "2px solid #1a1a1a",
                                            fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a",
                                        }}>@ {tip.odds}</span>
                                    </div>

                                    {/* Analysis */}
                                    <p style={{
                                        fontFamily: f, fontSize: "1.4rem", color: "#3d3c41",
                                        lineHeight: 1.6, fontStyle: "italic",
                                        borderLeft: `3px solid ${accent}`,
                                        paddingLeft: "1.2rem", margin: "0 0 1.6rem",
                                    }}>
                                        "{tip.analysis}"
                                    </p>

                                    {/* Specialist footer */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1.4rem", borderTop: "1px solid #f0f0f0" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                            <div style={{
                                                width: "3.2rem", height: "3.2rem", borderRadius: "50%",
                                                backgroundColor: accent,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <span style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                                                    {tip.specialist.avatar}
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{tip.specialist.name}</p>
                                                <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", margin: 0 }}>@{tip.specialist.handle} · {tip.time}</p>
                                            </div>
                                        </div>
                                        <img src="/logo.png" alt="Sureodds" style={{ height: "2rem", width: "auto", opacity: 0.6 }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "8rem 0" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>No tips for this filter</p>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Check back soon — our analysts update tips daily.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
