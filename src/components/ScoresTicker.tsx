"use client";
import { useRef, useState } from "react";

type Team = { rank?: number; code: string; record: string; score: number; isFinal: boolean };
type Game = { date: string; status: string; league: string; teams: [Team, Team] };

const games: Game[] = [
    { league: "PREMIER LEAGUE", date: "Mar 18", status: "Final", teams: [{ code: "CHE", record: "(12-8-6)", score: 1, isFinal: true }, { code: "ARS", record: "(18-4-4)", score: 2, isFinal: true }] },
    { league: "PREMIER LEAGUE", date: "Today", status: "7:45pm", teams: [{ code: "LIV", record: "(19-5-2)", score: 0, isFinal: false }, { code: "MCI", record: "(20-3-3)", score: 0, isFinal: false }] },
    { league: "PREMIER LEAGUE", date: "Mar 18", status: "Final", teams: [{ code: "MUN", record: "(10-7-9)", score: 2, isFinal: true }, { code: "TOT", record: "(13-6-7)", score: 0, isFinal: true }] },
    { league: "LA LIGA", date: "Mar 18", status: "Final", teams: [{ code: "BAR", record: "(20-4-2)", score: 2, isFinal: true }, { code: "RMA", record: "(22-3-1)", score: 4, isFinal: true }] },
    { league: "LA LIGA", date: "Mar 18", status: "Final", teams: [{ code: "SEV", record: "(10-6-10)", score: 0, isFinal: true }, { code: "ATM", record: "(16-7-3)", score: 1, isFinal: true }] },
    { league: "SERIE A", date: "Mar 18", status: "Final", teams: [{ code: "INT", record: "(21-4-1)", score: 2, isFinal: true }, { code: "ACM", record: "(17-5-4)", score: 2, isFinal: true }] },
    { league: "SERIE A", date: "Mar 18", status: "Final", teams: [{ code: "JUV", record: "(18-6-2)", score: 1, isFinal: true }, { code: "NAP", record: "(15-5-6)", score: 0, isFinal: true }] },
    { league: "BUNDESLIGA", date: "Mar 18", status: "Final", teams: [{ code: "BAY", record: "(23-2-1)", score: 5, isFinal: true }, { code: "DOR", record: "(16-4-6)", score: 1, isFinal: true }] },
    { league: "BUNDESLIGA", date: "Mar 18", status: "Final", teams: [{ code: "LEV", record: "(18-4-4)", score: 3, isFinal: true }, { code: "LEI", record: "(15-5-6)", score: 2, isFinal: true }] },
    { league: "CHAMPIONS LEAGUE", date: "Mar 18", status: "Final", teams: [{ code: "PSG", record: "(5-1-0)", score: 1, isFinal: true }, { code: "RMA", record: "(5-0-1)", score: 3, isFinal: true }] },
    { league: "CHAMPIONS LEAGUE", date: "Mar 18", status: "Final", teams: [{ code: "MCI", record: "(4-2-0)", score: 2, isFinal: true }, { code: "INT", record: "(4-1-1)", score: 2, isFinal: true }] },
];

const leagueOrder = ["PREMIER LEAGUE", "LA LIGA", "SERIE A", "BUNDESLIGA", "CHAMPIONS LEAGUE"];

const grouped = games.reduce<Record<string, Game[]>>((acc, g) => {
    (acc[g.league] ??= []).push(g); return acc;
}, {});

// Exact BR CSS token values
const f = '"Proxima Nova", Arial, sans-serif';

function TeamRow({ team }: { team: Team }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "2rem", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                <span style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 600, color: "#99989f", minWidth: "1.2rem", textAlign: "right", flexShrink: 0 }}>
                    {team.rank ?? ""}
                </span>
                <span style={{ fontSize: "1.6rem", lineHeight: 1, flexShrink: 0 }}>⚽</span>
                <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap" }}>{team.code}</span>
                <span style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 400, color: "#68676d", whiteSpace: "nowrap" }}>{team.record}</span>
            </div>
            {team.isFinal && (
                <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", flexShrink: 0, marginLeft: "0.8rem" }}>
                    {team.score}
                </span>
            )}
        </div>
    );
}

export default function ScoresTicker() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    function onScroll() {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }

    function scrollLeft() {
        scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
    }

    function scrollRight() {
        scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
    }

    const arrowBtn: React.CSSProperties = {
        width: "3.2rem", height: "3.2rem", borderRadius: "50%",
        border: "1px solid #ddd", backgroundColor: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", pointerEvents: "all", flexShrink: 0,
    };

    return (
        <div style={{ backgroundColor: "#f2f5f6", borderBottom: "1px solid #ddd" }}>
            <div style={{ maxWidth: "144rem", margin: "0 auto", position: "relative" }}>

                {/* Scrollable row — no scrollbar */}
                <div ref={scrollRef} onScroll={onScroll} style={{ overflowX: "auto", overflowY: "visible" }} className="scrollbar-hide">
                    <div style={{ display: "flex", alignItems: "flex-start", width: "max-content", padding: "0.8rem 5.6rem 0.8rem 2rem" }}>

                        {leagueOrder.map((league) => (
                            <div key={league} style={{ display: "flex", flexDirection: "column", marginLeft: "1.6rem" }}>
                                {/* League label */}
                                <span style={{ fontFamily: f, fontWeight: 700, fontSize: "1.1rem", color: "#68676d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.6rem" }}>
                                    {league}
                                </span>
                                {/* Game cards */}
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                    {grouped[league]?.map((game, gi) => (
                                        <a key={gi} href="#" style={{
                                            display: "flex", flexDirection: "column", gap: "0.2rem",
                                            backgroundColor: "#fff",
                                            border: "1px solid #ddd",
                                            borderRadius: "0.4rem",
                                            padding: "0.6rem 1rem",
                                            textDecoration: "none",
                                            minWidth: "16rem",
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>{game.date}</span>
                                                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>{game.status}</span>
                                            </div>
                                            <TeamRow team={game.teams[0]} />
                                            <TeamRow team={game.teams[1]} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Left fade + arrow */}
                {canScrollLeft && (
                    <div style={{
                        position: "absolute", top: 0, left: 0, bottom: 0, width: "8rem",
                        background: "linear-gradient(to left, transparent, #f2f5f6 60%)",
                        display: "flex", alignItems: "center", justifyContent: "flex-start",
                        paddingLeft: "1.2rem", pointerEvents: "none",
                    }}>
                        <button onClick={scrollLeft} style={arrowBtn}>
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2">
                                <path d="M7 1L1 7l6 6" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Right fade + arrow */}
                {canScrollRight && (
                    <div style={{
                        position: "absolute", top: 0, right: 0, bottom: 0, width: "8rem",
                        background: "linear-gradient(to right, transparent, #f2f5f6 60%)",
                        display: "flex", alignItems: "center", justifyContent: "flex-end",
                        paddingRight: "1.2rem", pointerEvents: "none",
                    }}>
                        <button onClick={scrollRight} style={arrowBtn}>
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2">
                                <path d="M1 1l6 6-6 6" />
                            </svg>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}