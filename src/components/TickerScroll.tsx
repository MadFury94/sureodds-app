"use client";
import { useRef, useState } from "react";
import type { MatchCard } from "@/lib/footballdata";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

export default function TickerScroll({ matches }: { matches: MatchCard[] }) {
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
        scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

    const arrowStyle: React.CSSProperties = {
        width: "3.2rem", height: "3.2rem", borderRadius: "50%",
        border: "1px solid #ddd", backgroundColor: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0, pointerEvents: "all",
    };

    return (
        <div style={{ position: "relative" }}>
            <div
                ref={scrollRef}
                onScroll={onScroll}
                className="scrollbar-hide"
                style={{ overflowX: "auto", padding: "0.8rem 5.6rem 0.8rem 1.2rem" }}
            >
                <div style={{ display: "flex", gap: "0.8rem", width: "max-content" }}>
                    {matches.map((m) => {
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
                                    <span style={{
                                        fontFamily: f, fontSize: "1rem", color: "#99989f",
                                        textTransform: "uppercase", letterSpacing: "0.04em",
                                        overflow: "hidden", textOverflow: "ellipsis",
                                        whiteSpace: "nowrap", maxWidth: "9rem",
                                    }}>
                                        {m.competition}
                                    </span>
                                    {isLive ? (
                                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span style={{
                                                width: "0.6rem", height: "0.6rem", borderRadius: "50%",
                                                backgroundColor: "#e9173d", display: "inline-block",
                                                animation: "livePulse 1.6s ease-in-out infinite",
                                            }} />
                                            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#e9173d" }}>LIVE</span>
                                        </span>
                                    ) : (
                                        <span style={{
                                            fontFamily: f, fontSize: "1rem", fontWeight: 600,
                                            color: isFT ? "#68676d" : "#e9173d", flexShrink: 0,
                                        }}>
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
                                                <img src={t.crest} alt="" width={14} height={14}
                                                    style={{ width: "1.4rem", height: "1.4rem", objectFit: "contain", flexShrink: 0 }} />
                                            )}
                                            <span style={{
                                                fontFamily: f, fontSize: "1.2rem", fontWeight: 700,
                                                color: "#1a1a1a", overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}>{t.name}</span>
                                        </div>
                                        {!isNS && t.score !== null && (
                                            <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", flexShrink: 0 }}>
                                                {t.score}
                                            </span>
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
                <div style={{
                    position: "absolute", top: 0, left: 0, bottom: 0, width: "7rem",
                    background: "linear-gradient(to left, transparent, #f2f5f6 65%)",
                    display: "flex", alignItems: "center", paddingLeft: "1.2rem", pointerEvents: "none",
                }}>
                    <button onClick={() => scroll(-1)} style={arrowStyle} aria-label="Scroll left">
                        <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2">
                            <path d="M7 1L1 7l6 6" />
                        </svg>
                    </button>
                </div>
            )}
            {canRight && (
                <div style={{
                    position: "absolute", top: 0, right: 0, bottom: 0, width: "7rem",
                    background: "linear-gradient(to right, transparent, #f2f5f6 65%)",
                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                    paddingRight: "1.2rem", pointerEvents: "none",
                }}>
                    <button onClick={() => scroll(1)} style={arrowStyle} aria-label="Scroll right">
                        <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2">
                            <path d="M1 1l6 6-6 6" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
