"use client";
import { fonts, colors, LEAGUE_LOGOS } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

// League crest URLs from football-data.org (free, no auth for crests)
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
};

const LEAGUE_BG: Record<string, string> = {
    "Champions League": "#0a0e3a",
    "Premier League": "#1a0a2e",
    "La Liga": "#1a0800",
    "Serie A": "#001a3a",
    "Bundesliga": "#1a0a00",
    "AFCON": "#001a0a",
};

const LEAGUE_ACCENT: Record<string, string> = {
    "Champions League": "#1a1f71",
    "Premier League": "#38003c",
    "La Liga": "#ff4b00",
    "Serie A": "#003399",
    "Bundesliga": "#d20515",
    "AFCON": "#009a44",
};

const CONFIDENCE_COLOR: Record<string, string> = {
    Low: "#99989f", Medium: "#f59e0b", High: "#22c55e", Banker: "#e9173d",
};

const TIPS = [
    { league: "Champions League", home: "Real Madrid", away: "Man City", outcome: "Home Win", odds: "2.10", confidence: "High", punter: "PaulBets", note: "Madrid always deliver at the Bernabeu" },
    { league: "Premier League", home: "Arsenal", away: "Chelsea", outcome: "Home Win", odds: "1.85", confidence: "Banker", punter: "OddsKing", note: "Arsenal's home record is unreal" },
    { league: "La Liga", home: "Barcelona", away: "Atletico", outcome: "Draw", odds: "3.40", confidence: "Medium", punter: "TipsterNG", note: "Atletico always make it tight" },
    { league: "Serie A", home: "Inter Milan", away: "Juventus", outcome: "Home Win", odds: "2.25", confidence: "High", punter: "FootballGuru", note: "Inter are the best team in Italy" },
    { league: "Premier League", home: "Liverpool", away: "Man City", outcome: "Draw", odds: "3.20", confidence: "Medium", punter: "AnfieldKing", note: "Both teams in top form — tight one" },
    { league: "Champions League", home: "Bayern Munich", away: "PSG", outcome: "Home Win", odds: "1.95", confidence: "High", punter: "BundesKing", note: "Bayern at home is a fortress" },
];

const PILLS = [
    { icon: "🎯", text: "Drop Your Sure Odds" },
    { icon: "🔥", text: "Banker Tips Today" },
    { icon: "⚽", text: "Community Predictions" },
    { icon: "📊", text: "Odds & Analysis" },
    { icon: "🏆", text: "UCL Sure Bets" },
    { icon: "💰", text: "High Confidence Picks" },
    { icon: "🌍", text: "All Leagues Covered" },
    { icon: "⚡", text: "Live Tip Updates" },
];

function TeamCrest({ name, size = 28 }: { name: string; size?: number }) {
    const src = TEAM_CRESTS[name];
    if (src) {
        return <img src={src} alt={name} width={size} height={size} style={{ objectFit: "contain", flexShrink: 0 }} />;
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            backgroundColor: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <span style={{ fontFamily: f, fontSize: `${size * 0.38}px`, fontWeight: 700, color: "#fff" }}>
                {name.slice(0, 2).toUpperCase()}
            </span>
        </div>
    );
}

function PhoneCard({ tip }: { tip: typeof TIPS[0] }) {
    const bg = LEAGUE_BG[tip.league] ?? "#0a0a1a";
    const accent = LEAGUE_ACCENT[tip.league] ?? colors.primary;
    const confColor = CONFIDENCE_COLOR[tip.confidence] ?? "#fff";
    const leagueLogo = LEAGUE_LOGOS[tip.league === "Champions League" ? "ucl" : tip.league === "Premier League" ? "epl" : tip.league === "La Liga" ? "la-liga" : ""];

    return (
        <div style={{
            width: "19rem", flexShrink: 0,
            borderRadius: "3rem",
            border: "2.5px solid rgba(255,255,255,0.08)",
            backgroundColor: "#111",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)",
            position: "relative",
        }}>
            {/* Notch */}
            <div style={{
                position: "absolute", top: "1rem", left: "50%", transform: "translateX(-50%)",
                width: "5.5rem", height: "1.1rem",
                backgroundColor: "#000", borderRadius: "10rem", zIndex: 3,
            }} />

            {/* Phone screen content */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

                {/* Top: league header */}
                <div style={{
                    background: `linear-gradient(135deg, ${bg} 0%, ${accent}55 100%)`,
                    padding: "3.2rem 1.4rem 1.6rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                        {leagueLogo ? (
                            <img src={leagueLogo} alt={tip.league} width={22} height={22} style={{ objectFit: "contain" }} />
                        ) : (
                            <div style={{ width: 22, height: 22, borderRadius: "0.3rem", backgroundColor: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>⚽</span>
                            </div>
                        )}
                        <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {tip.league}
                        </span>
                    </div>
                    {/* Confidence badge */}
                    <span style={{
                        fontFamily: f, fontSize: "0.85rem", fontWeight: 700,
                        color: confColor, backgroundColor: confColor + "22",
                        border: `1px solid ${confColor}`,
                        padding: "0.2rem 0.7rem", borderRadius: "10rem",
                    }}>
                        {tip.confidence}
                    </span>
                </div>

                {/* Middle: match */}
                <div style={{
                    background: bg,
                    padding: "1.6rem 1.4rem",
                    display: "flex", flexDirection: "column", gap: "1.4rem",
                    flex: 1,
                }}>
                    {/* Teams */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                            <TeamCrest name={tip.home} size={32} />
                            <span style={{ fontFamily: f, fontSize: "0.9rem", fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
                                {tip.home}
                            </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ fontFamily: fd, fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>VS</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                            <TeamCrest name={tip.away} size={32} />
                            <span style={{ fontFamily: f, fontSize: "0.9rem", fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
                                {tip.away}
                            </span>
                        </div>
                    </div>

                    {/* Prediction + odds */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                            fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#fff",
                            backgroundColor: colors.primary, padding: "0.4rem 1rem", borderRadius: "10rem",
                        }}>
                            {tip.outcome}
                        </span>
                        <span style={{
                            fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff",
                        }}>
                            @ {tip.odds}
                        </span>
                    </div>

                    {/* Note */}
                    <p style={{
                        fontFamily: f, fontSize: "0.9rem", color: "rgba(255,255,255,0.55)",
                        lineHeight: 1.4, fontStyle: "italic",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                        margin: 0,
                    }}>
                        "{tip.note}"
                    </p>
                </div>

                {/* Bottom: punter + sureodds logo */}
                <div style={{
                    backgroundColor: "#0a0a0a",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "1rem 1.4rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{
                            width: "2.4rem", height: "2.4rem", borderRadius: "50%",
                            backgroundColor: accent,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ fontFamily: f, fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>
                                {tip.punter.slice(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <span style={{ fontFamily: f, fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                            {tip.punter}
                        </span>
                    </div>
                    {/* Sureodds logo */}
                    <img src="/logo.png" alt="Sureodds" style={{ height: "1.6rem", width: "auto", opacity: 0.7 }} />
                </div>

            </div>
        </div>
    );
}

export default function PhoneMarquee() {
    return (
        <section style={{ backgroundColor: "#0a0a0a", overflow: "hidden", padding: "5rem 0 6rem" }}>

            {/* Heading */}
            <div style={{ textAlign: "center", marginBottom: "3.2rem", padding: "0 1.2rem" }}>
                <h2 style={{
                    fontFamily: fd, fontWeight: 700,
                    fontSize: "clamp(2rem, 4vw, 3.2rem)",
                    color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
                }}>
                    Sure Odds. <span style={{ color: "#BD4110" }}>Every Day.</span>
                </h2>
                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", marginTop: "0.8rem" }}>
                    Community predictions from punters who know the game
                </p>
                <a href="/betting" style={{
                    display: "inline-flex", alignItems: "center", gap: "0.6rem",
                    marginTop: "1.6rem", padding: "1rem 2.4rem",
                    backgroundColor: "#BD4110", color: "#fff",
                    fontFamily: f, fontWeight: 700, fontSize: "1.4rem",
                    borderRadius: "10rem", textDecoration: "none",
                }}>
                    Drop Your Tip →
                </a>
            </div>

            {/* ── Row 1: pill ticker LEFT ── */}
            <div style={{ overflow: "hidden", marginBottom: "3.2rem" }}>
                <div className="pm-track-left">
                    {[...PILLS, ...PILLS].map((pill, i) => (
                        <div key={i} style={{
                            display: "inline-flex", alignItems: "center", gap: "0.8rem",
                            padding: "0.7rem 1.8rem", borderRadius: "10rem",
                            border: "1px solid #2a2a2a", backgroundColor: "#141414",
                            whiteSpace: "nowrap", flexShrink: 0,
                        }}>
                            <span style={{ fontSize: "1.4rem" }}>{pill.icon}</span>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#c9c9c9" }}>
                                {pill.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Row 2: phone cards RIGHT ── */}
            <div style={{ overflow: "hidden" }}>
                <div className="pm-track-right">
                    {[...TIPS, ...TIPS].map((tip, i) => (
                        <PhoneCard key={i} tip={tip} />
                    ))}
                </div>
            </div>

        </section>
    );
}
