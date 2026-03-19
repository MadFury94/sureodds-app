"use client";
import { useRef, useState } from "react";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

interface Match {
    home: string; away: string;
    homeScore?: number; awayScore?: number;
    date: string; time?: string; competition: string;
    status: "FT" | "HT" | "LIVE" | "NS";
    minute?: string;
    stadium?: string;
}
interface Standing {
    pos: number; team: string; played: number;
    won: number; drawn: number; lost: number; gd: number; pts: number;
}
interface OtherLeague { name: string; href: string; flag: string; }

const LEAGUE_SPORTS = new Set(["epl", "la-liga", "ucl", "afcon"]);

const SCORES: Record<string, Match[]> = {
    epl: [
        { home: "Arsenal", away: "Man City", homeScore: 2, awayScore: 1, date: "Mar 15", competition: "Premier League", status: "FT", stadium: "Emirates" },
        { home: "Liverpool", away: "Chelsea", homeScore: 3, awayScore: 1, date: "Mar 15", competition: "Premier League", status: "FT", stadium: "Anfield" },
        { home: "Man Utd", away: "Tottenham", homeScore: 0, awayScore: 2, date: "Mar 16", competition: "Premier League", status: "FT", stadium: "Old Trafford" },
        { home: "Newcastle", away: "Aston Villa", homeScore: 1, awayScore: 1, date: "Mar 16", competition: "Premier League", status: "FT", stadium: "St. James' Park" },
        { home: "Brighton", away: "Wolves", homeScore: 2, awayScore: 0, date: "Mar 17", competition: "Premier League", status: "FT", stadium: "Amex Stadium" },
    ],
    "la-liga": [
        { home: "Real Madrid", away: "Barcelona", homeScore: 3, awayScore: 2, date: "Mar 15", competition: "La Liga", status: "FT", stadium: "Bernabéu" },
        { home: "Atletico", away: "Sevilla", homeScore: 1, awayScore: 0, date: "Mar 16", competition: "La Liga", status: "FT", stadium: "Metropolitano" },
        { home: "Valencia", away: "Villarreal", homeScore: 2, awayScore: 2, date: "Mar 16", competition: "La Liga", status: "FT", stadium: "Mestalla" },
        { home: "Betis", away: "Osasuna", homeScore: 3, awayScore: 1, date: "Mar 17", competition: "La Liga", status: "FT", stadium: "Benito Villamarín" },
    ],
    ucl: [
        { home: "Real Madrid", away: "Man City", homeScore: 1, awayScore: 1, date: "Mar 12", competition: "UCL QF", status: "FT", stadium: "Bernabéu" },
        { home: "Bayern", away: "Arsenal", homeScore: 0, awayScore: 2, date: "Mar 12", competition: "UCL QF", status: "FT", stadium: "Allianz Arena" },
        { home: "PSG", away: "Barcelona", homeScore: 2, awayScore: 3, date: "Mar 13", competition: "UCL QF", status: "FT", stadium: "Parc des Princes" },
        { home: "Inter", away: "Atletico", homeScore: 1, awayScore: 0, date: "Mar 13", competition: "UCL QF", status: "FT", stadium: "San Siro" },
    ],
    afcon: [
        { home: "Nigeria", away: "Ivory Coast", homeScore: 1, awayScore: 2, date: "Feb 11", competition: "AFCON Final", status: "FT", stadium: "Stade de Marrakech" },
        { home: "Morocco", away: "South Africa", homeScore: 2, awayScore: 0, date: "Feb 7", competition: "AFCON SF", status: "FT", stadium: "Stade Ibn Batouta" },
        { home: "Egypt", away: "DR Congo", homeScore: 1, awayScore: 1, date: "Feb 7", competition: "AFCON SF", status: "FT", stadium: "Stade de Tanger" },
    ],
};

const FIXTURES: Record<string, Match[]> = {
    epl: [
        { home: "Arsenal", away: "Liverpool", date: "Mar 22", time: "17:30", competition: "Premier League", status: "NS", stadium: "Emirates" },
        { home: "Man City", away: "Chelsea", date: "Mar 22", time: "15:00", competition: "Premier League", status: "NS", stadium: "Etihad" },
        { home: "Tottenham", away: "Man Utd", date: "Mar 23", time: "14:00", competition: "Premier League", status: "NS", stadium: "Tottenham Hotspur Stadium" },
        { home: "Aston Villa", away: "Newcastle", date: "Mar 23", time: "16:30", competition: "Premier League", status: "NS", stadium: "Villa Park" },
        { home: "Wolves", away: "Brighton", date: "Mar 29", time: "15:00", competition: "Premier League", status: "NS", stadium: "Molineux" },
        { home: "Brentford", away: "Everton", date: "Mar 29", time: "15:00", competition: "Premier League", status: "NS", stadium: "Gtech Community Stadium" },
    ],
    "la-liga": [
        { home: "Barcelona", away: "Real Madrid", date: "Mar 22", time: "21:00", competition: "La Liga", status: "NS", stadium: "Camp Nou" },
        { home: "Sevilla", away: "Atletico", date: "Mar 23", time: "18:30", competition: "La Liga", status: "NS", stadium: "Ramón Sánchez-Pizjuán" },
        { home: "Villarreal", away: "Valencia", date: "Mar 23", time: "16:15", competition: "La Liga", status: "NS", stadium: "Estadio de la Cerámica" },
        { home: "Osasuna", away: "Betis", date: "Mar 29", time: "14:00", competition: "La Liga", status: "NS", stadium: "El Sadar" },
        { home: "Girona", away: "Athletic Bilbao", date: "Mar 29", time: "16:15", competition: "La Liga", status: "NS", stadium: "Montilivi" },
    ],
    ucl: [
        { home: "Man City", away: "Real Madrid", date: "Apr 9", time: "20:00", competition: "UCL QF 2nd Leg", status: "NS", stadium: "Etihad" },
        { home: "Arsenal", away: "Bayern", date: "Apr 9", time: "20:00", competition: "UCL QF 2nd Leg", status: "NS", stadium: "Emirates" },
        { home: "Barcelona", away: "PSG", date: "Apr 10", time: "20:00", competition: "UCL QF 2nd Leg", status: "NS", stadium: "Camp Nou" },
        { home: "Atletico", away: "Inter", date: "Apr 10", time: "20:00", competition: "UCL QF 2nd Leg", status: "NS", stadium: "Metropolitano" },
    ],
    afcon: [
        { home: "Nigeria", away: "Ghana", date: "Jun 15", time: "18:00", competition: "AFCON 2025 Qual", status: "NS", stadium: "Abuja National Stadium" },
        { home: "Senegal", away: "Morocco", date: "Jun 15", time: "20:00", competition: "AFCON 2025 Qual", status: "NS", stadium: "Stade Léopold Sédar Senghor" },
        { home: "Egypt", away: "Cameroon", date: "Jun 16", time: "18:00", competition: "AFCON 2025 Qual", status: "NS", stadium: "Cairo International Stadium" },
        { home: "Ivory Coast", away: "Mali", date: "Jun 16", time: "20:00", competition: "AFCON 2025 Qual", status: "NS", stadium: "Stade Félix Houphouët-Boigny" },
    ],
};

// Generic fallback for non-league categories
const DEFAULT_FIXTURES: Match[] = [
    { home: "Arsenal", away: "Liverpool", date: "Mar 22", time: "17:30", competition: "Premier League", status: "NS", stadium: "Emirates" },
    { home: "Barcelona", away: "Real Madrid", date: "Mar 22", time: "21:00", competition: "La Liga", status: "NS", stadium: "Camp Nou" },
    { home: "Man City", away: "Chelsea", date: "Mar 23", time: "15:00", competition: "Premier League", status: "NS", stadium: "Etihad" },
    { home: "Bayern", away: "Dortmund", date: "Mar 23", time: "17:30", competition: "Bundesliga", status: "NS", stadium: "Allianz Arena" },
    { home: "PSG", away: "Lyon", date: "Mar 24", time: "21:00", competition: "Ligue 1", status: "NS", stadium: "Parc des Princes" },
];

const DEFAULT_SCORES: Match[] = [
    { home: "Man Utd", away: "Arsenal", homeScore: 1, awayScore: 2, date: "Mar 15", competition: "Premier League", status: "FT" },
    { home: "Real Madrid", away: "Barcelona", homeScore: 3, awayScore: 2, date: "Mar 15", competition: "La Liga", status: "FT" },
    { home: "Bayern", away: "Dortmund", homeScore: 2, awayScore: 0, date: "Mar 16", competition: "Bundesliga", status: "FT" },
    { home: "PSG", away: "Lyon", homeScore: 4, awayScore: 1, date: "Mar 16", competition: "Ligue 1", status: "FT" },
    { home: "Inter", away: "AC Milan", homeScore: 2, awayScore: 2, date: "Mar 17", competition: "Serie A", status: "FT" },
];

const STANDINGS: Record<string, Standing[]> = {
    epl: [
        { pos: 1, team: "Liverpool", played: 29, won: 21, drawn: 5, lost: 3, gd: 40, pts: 68 },
        { pos: 2, team: "Arsenal", played: 29, won: 19, drawn: 6, lost: 4, gd: 32, pts: 63 },
        { pos: 3, team: "Man City", played: 29, won: 17, drawn: 5, lost: 7, gd: 22, pts: 56 },
        { pos: 4, team: "Chelsea", played: 29, won: 16, drawn: 6, lost: 7, gd: 16, pts: 54 },
        { pos: 5, team: "Aston Villa", played: 29, won: 15, drawn: 5, lost: 9, gd: 12, pts: 50 },
        { pos: 6, team: "Tottenham", played: 29, won: 14, drawn: 6, lost: 9, gd: 7, pts: 48 },
        { pos: 7, team: "Newcastle", played: 29, won: 13, drawn: 7, lost: 9, gd: 8, pts: 46 },
        { pos: 8, team: "Man Utd", played: 29, won: 11, drawn: 5, lost: 13, gd: -10, pts: 38 },
    ],
    "la-liga": [
        { pos: 1, team: "Real Madrid", played: 29, won: 22, drawn: 4, lost: 3, gd: 44, pts: 70 },
        { pos: 2, team: "Barcelona", played: 29, won: 20, drawn: 5, lost: 4, gd: 36, pts: 65 },
        { pos: 3, team: "Atletico", played: 29, won: 17, drawn: 6, lost: 6, gd: 25, pts: 57 },
        { pos: 4, team: "Athletic Bilbao", played: 29, won: 15, drawn: 7, lost: 7, gd: 13, pts: 52 },
        { pos: 5, team: "Villarreal", played: 29, won: 13, drawn: 6, lost: 10, gd: 4, pts: 45 },
        { pos: 6, team: "Betis", played: 29, won: 12, drawn: 7, lost: 10, gd: 0, pts: 43 },
    ],
    ucl: [
        { pos: 1, team: "Real Madrid", played: 8, won: 6, drawn: 1, lost: 1, gd: 10, pts: 19 },
        { pos: 2, team: "Man City", played: 8, won: 5, drawn: 2, lost: 1, gd: 7, pts: 17 },
        { pos: 3, team: "Arsenal", played: 8, won: 5, drawn: 1, lost: 2, gd: 4, pts: 16 },
        { pos: 4, team: "Barcelona", played: 8, won: 5, drawn: 1, lost: 2, gd: 4, pts: 16 },
        { pos: 5, team: "Bayern", played: 8, won: 4, drawn: 2, lost: 2, gd: 4, pts: 14 },
        { pos: 6, team: "Inter", played: 8, won: 4, drawn: 1, lost: 3, gd: 1, pts: 13 },
    ],
    afcon: [
        { pos: 1, team: "Morocco", played: 5, won: 4, drawn: 1, lost: 0, gd: 8, pts: 13 },
        { pos: 2, team: "Nigeria", played: 5, won: 3, drawn: 1, lost: 1, gd: 4, pts: 10 },
        { pos: 3, team: "Ivory Coast", played: 5, won: 3, drawn: 0, lost: 2, gd: 2, pts: 9 },
        { pos: 4, team: "Senegal", played: 5, won: 2, drawn: 2, lost: 1, gd: 1, pts: 8 },
        { pos: 5, team: "Egypt", played: 5, won: 2, drawn: 1, lost: 2, gd: -1, pts: 7 },
        { pos: 6, team: "South Africa", played: 5, won: 1, drawn: 2, lost: 2, gd: -3, pts: 5 },
    ],
};

const OTHER_LEAGUES: OtherLeague[] = [
    { name: "Premier League", href: "/category/epl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "La Liga", href: "/category/la-liga", flag: "🇪🇸" },
    { name: "Champions League", href: "/category/ucl", flag: "⭐" },
    { name: "AFCON", href: "/category/afcon", flag: "🌍" },
    { name: "Serie A", href: "#", flag: "🇮🇹" },
    { name: "Bundesliga", href: "#", flag: "🇩🇪" },
    { name: "Ligue 1", href: "#", flag: "🇫🇷" },
];

// ── Scores Ticker (below PageHeader) ──────────────────────────────────────
export function CategoryScoresTicker({ sport, color }: { sport: string; color: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const scores = SCORES[sport] ?? DEFAULT_SCORES;
    const fixtures = FIXTURES[sport] ?? DEFAULT_FIXTURES;
    const all = [...scores, ...fixtures];

    function onScroll() {
        const el = scrollRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 0);
        setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }
    const scroll = (dir: 1 | -1) =>
        scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

    const arrowBtn: React.CSSProperties = {
        width: "3.2rem", height: "3.2rem", borderRadius: "50%",
        border: "1px solid #ddd", backgroundColor: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0, pointerEvents: "all",
    };

    return (
        <div style={{ backgroundColor: "#f2f5f6", borderBottom: "1px solid #ddd" }}>
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", position: "relative" }}>
                <div ref={scrollRef} onScroll={onScroll} className="scrollbar-hide"
                    style={{ overflowX: "auto", padding: "0.8rem 5.6rem 0.8rem 1.2rem" }}>
                    <div style={{ display: "flex", gap: "0.8rem", width: "max-content" }}>
                        {all.map((m, i) => {
                            const isNS = m.status === "NS";
                            const isLive = m.status === "LIVE" || m.status === "HT";
                            return (
                                <div key={i} style={{
                                    display: "flex", flexDirection: "column", gap: "0.3rem",
                                    backgroundColor: "#fff", border: "1px solid #e0e0e0",
                                    borderRadius: "0.4rem", padding: "0.6rem 1rem",
                                    minWidth: "15rem",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                                        <span style={{ fontFamily: f, fontSize: "1rem", color: "#99989f", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                            {m.competition}
                                        </span>
                                        {isLive ? (
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                                <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", backgroundColor: "#e9173d", display: "inline-block", animation: "livePulse 1.6s ease-in-out infinite" }} />
                                                <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#e9173d" }}>{m.minute ?? "LIVE"}</span>
                                            </span>
                                        ) : (
                                            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 600, color: isNS ? color : "#68676d" }}>
                                                {isNS ? (m.time ?? m.date) : "FT"}
                                            </span>
                                        )}
                                    </div>
                                    {[{ name: m.home, score: m.homeScore }, { name: m.away, score: m.awayScore }].map((t, ti) => (
                                        <div key={ti} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>{t.name}</span>
                                            {!isNS && <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>{t.score}</span>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {canLeft && (
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "7rem", background: "linear-gradient(to left, transparent, #f2f5f6 65%)", display: "flex", alignItems: "center", paddingLeft: "1.2rem", pointerEvents: "none" }}>
                        <button onClick={() => scroll(-1)} style={arrowBtn}>
                            <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M7 1L1 7l6 6" /></svg>
                        </button>
                    </div>
                )}
                {canRight && (
                    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "7rem", background: "linear-gradient(to right, transparent, #f2f5f6 65%)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "1.2rem", pointerEvents: "none" }}>
                        <button onClick={() => scroll(1)} style={arrowBtn}>
                            <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M1 1l6 6-6 6" /></svg>
                        </button>
                    </div>
                )}
            </div>
            <style>{`@keyframes livePulse{0%,100%{box-shadow:0 0 0 0 rgba(233,23,61,.5)}50%{box-shadow:0 0 0 5px rgba(233,23,61,0)}}`}</style>
        </div>
    );
}

// ── Fixtures Row — horizontal scrollable cards, MostRead card style ────────
export function FixturesRow({ sport, color, label }: { sport: string; color: string; label: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const fixtures = FIXTURES[sport] ?? DEFAULT_FIXTURES;

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

    return (
        <section style={{ padding: "4rem 0 0" }}>
            {/* Header */}
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

            {/* Scrollable cards */}
            <div ref={scrollRef} onScroll={onScroll} className="scrollbar-hide" style={{ overflowX: "auto" }}>
                <div style={{ display: "flex", gap: "1.6rem", width: "max-content" }}>
                    {fixtures.map((m, i) => (
                        <div key={i} style={{
                            width: "24rem", flexShrink: 0,
                            backgroundColor: "#fff",
                            borderRadius: "1rem",
                            border: "1px solid #e8ebed",
                            overflow: "hidden",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        }}>
                            {/* Top accent bar */}
                            <div style={{ height: "0.4rem", backgroundColor: color }} />

                            <div style={{ padding: "1.6rem" }}>
                                {/* Competition + date */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                                    <span style={{
                                        fontFamily: f, fontSize: "1.05rem", fontWeight: 700,
                                        color: "#fff", backgroundColor: color,
                                        padding: "0.25rem 0.7rem", borderRadius: "0.3rem",
                                        textTransform: "uppercase", letterSpacing: "0.06em",
                                    }}>{m.competition}</span>
                                    <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>{m.date}</span>
                                </div>

                                {/* Teams vs layout */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "1.4rem" }}>
                                    {/* Home */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                                        {/* Team crest placeholder */}
                                        <div style={{
                                            width: "4.4rem", height: "4.4rem", borderRadius: "50%",
                                            backgroundColor: "#f2f5f6", border: "2px solid #e8ebed",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <span style={{ fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                {m.home.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center", lineHeight: 1.2 }}>{m.home}</span>
                                    </div>

                                    {/* VS + time */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                                        <span style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#e8ebed" }}>VS</span>
                                        <span style={{
                                            fontFamily: fd, fontSize: "1.6rem", fontWeight: 700,
                                            color: color, letterSpacing: "0.02em",
                                        }}>{m.time}</span>
                                    </div>

                                    {/* Away */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                                        <div style={{
                                            width: "4.4rem", height: "4.4rem", borderRadius: "50%",
                                            backgroundColor: "#f2f5f6", border: "2px solid #e8ebed",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <span style={{ fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                {m.away.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textAlign: "center", lineHeight: 1.2 }}>{m.away}</span>
                                    </div>
                                </div>

                                {/* Stadium */}
                                {m.stadium && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1rem", borderTop: "1px solid #f2f5f6" }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#99989f" strokeWidth="2">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                            <circle cx="12" cy="9" r="2.5" />
                                        </svg>
                                        <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>{m.stadium}</span>
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

// ── Standings sidebar ──────────────────────────────────────────────────────
function StandingsSidebar({ sport, color }: { sport: string; color: string }) {
    const rows = STANDINGS[sport] ?? [];

    return (
        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
            <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #e8ebed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Standings</span>
                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>2024/25</span>
            </div>
            {/* Column headers */}
            <div className="standings-table" style={{ padding: "0.6rem 1.4rem", backgroundColor: "#f9fafb", borderBottom: "1px solid #f0f0f0" }}>
                {["#", "Club", "P", "W", "GD", "Pts"].map(h => (
                    <span key={h} style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "Club" ? "left" : "center" }}>{h}</span>
                ))}
            </div>
            {rows.map((row, i) => {
                const isTop4 = row.pos <= 4;
                return (
                    <div key={row.pos} className="standings-table" style={{
                        padding: "0.9rem 1.4rem",
                        borderBottom: i < rows.length - 1 ? "1px solid #f5f5f5" : "none",
                        backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                        borderLeft: `3px solid ${isTop4 ? color : "transparent"}`,
                    }}>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: isTop4 ? color : "#99989f", textAlign: "center", alignSelf: "center" }}>{row.pos}</span>
                        <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", alignSelf: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.team}</span>
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

// ── Other leagues sidebar (non-league pages) ───────────────────────────────
function OtherLeaguesSidebar({ sport, color }: { sport: string; color: string }) {
    const recentAll = Object.values(SCORES).flat().slice(0, 6);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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

            <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #e8ebed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Scores</span>
                    <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>All Leagues</span>
                </div>
                {recentAll.map((m, i) => (
                    <div key={i} style={{ padding: "1rem 1.6rem", borderBottom: i < recentAll.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <span style={{ fontFamily: f, fontSize: "1rem", color: "#99989f", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "0.4rem" }}>{m.competition}</span>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", flex: 1 }}>{m.home}</span>
                            <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", padding: "0 0.8rem" }}>{m.homeScore} – {m.awayScore}</span>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", flex: 1, textAlign: "right" }}>{m.away}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main sidebar export ────────────────────────────────────────────────────
interface SidebarProps { sport: string; color: string; }

export default function CategorySidebar({ sport, color }: SidebarProps) {
    const isLeague = LEAGUE_SPORTS.has(sport);
    return (
        <aside style={{ position: "sticky", top: "9rem" }}>
            {isLeague
                ? <StandingsSidebar sport={sport} color={color} />
                : <OtherLeaguesSidebar sport={sport} color={color} />
            }
        </aside>
    );
}
