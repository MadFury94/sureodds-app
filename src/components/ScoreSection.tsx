"use client";
import { useRef, useState } from "react";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

interface MatchCard {
    title: string;
    emoji?: string;
    image: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: string;
}

interface Props {
    title: string;
    cards: MatchCard[];
}

export default function ScoreSection({ title, cards }: Props) {
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

    return (
        <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
            <section style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "5rem 1.2rem 5rem" }}>

                {/* Header — identical to MostRead */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                    <span style={{ fontFamily: f, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a" }}>
                        {title}
                    </span>
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                        <button onClick={() => scroll(-1)} disabled={!canLeft} style={{ ...arrowStyle, opacity: canLeft ? 1 : 0.35 }} aria-label="Previous">
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M7 1L1 7l6 6" /></svg>
                        </button>
                        <button onClick={() => scroll(1)} disabled={!canRight} style={{ ...arrowStyle, opacity: canRight ? 1 : 0.35 }} aria-label="Next">
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M1 1l6 6-6 6" /></svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable 4-col grid — identical layout to MostRead */}
                <div ref={scrollRef} onScroll={onScroll} className="scrollbar-hide" style={{ overflowX: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, calc(25% - 0.9rem))", gap: "2.84rem", width: "max-content", minWidth: "100%" }}>
                        {cards.map((card, i) => (
                            <a key={i} href="#" style={{ display: "flex", flexDirection: "column", textDecoration: "none", width: "calc((132.48rem - 4rem - 3 * 1.2rem) / 4)" }}>

                                {/* Image with score overlay */}
                                <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem", position: "relative" }}>
                                    <img src={card.image} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)" }} />
                                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem 1.4rem" }}>
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.3rem" }}>
                                            <span style={{ fontFamily: f, fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                {card.status}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                                <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "3rem", color: "#fff", lineHeight: 1 }}>{card.homeScore}</span>
                                                <span style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{card.homeTeam}</span>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
                                                <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "3rem", color: "#fff", lineHeight: 1 }}>{card.awayScore}</span>
                                                <span style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{card.awayTeam}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Title below — same as MostRead */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "0.8rem 0 0" }}>
                                    {card.emoji && <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0, marginTop: "0.1rem" }}>{card.emoji}</span>}
                                    <span className="clamp2" style={{ fontFamily: f, fontSize: "1.875rem", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.25 }}>
                                        {card.title}
                                    </span>
                                </div>

                            </a>
                        ))}
                    </div>
                </div>

            </section>
        </div>
    );
}
