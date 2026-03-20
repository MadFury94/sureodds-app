"use client";
import { useState } from "react";

interface Item { title: string; slug: string; image: string; date: string; }

import { colors, fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

export default function TrendingBarScroll({ items }: { items: Item[] }) {
    const [paused, setPaused] = useState(false);

    // Duplicate for seamless loop
    const loop = [...items, ...items];

    return (
        <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8ebed" }}>
            <div style={{
                maxWidth: "132.48rem", margin: "0 auto",
                display: "flex", alignItems: "stretch", height: "5.6rem",
            }}>

                {/* Label */}
                <div style={{
                    flexShrink: 0, display: "flex", alignItems: "center",
                    gap: "0.7rem", padding: "0 1.8rem 0 1.2rem",
                    borderRight: "1px solid #e8ebed",
                }}>
                    <span style={{
                        width: "0.65rem", height: "0.65rem", borderRadius: "50%",
                        backgroundColor: "#e9173d", flexShrink: 0,
                        animation: "tickerDot 1.8s ease-in-out infinite",
                        display: "inline-block",
                    }} />
                    <span style={{
                        fontFamily: fd, fontWeight: 700, fontSize: "1.15rem",
                        color: "#1a1a1a", textTransform: "uppercase",
                        letterSpacing: "0.07em", whiteSpace: "nowrap",
                    }}>
                        Top Stories
                    </span>
                </div>

                {/* Marquee window */}
                <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                    {/* Left fade */}
                    <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: "4rem",
                        background: "linear-gradient(to right, #fff, transparent)",
                        zIndex: 2, pointerEvents: "none",
                    }} />
                    {/* Right fade */}
                    <div style={{
                        position: "absolute", right: 0, top: 0, bottom: 0, width: "4rem",
                        background: "linear-gradient(to left, #fff, transparent)",
                        zIndex: 2, pointerEvents: "none",
                    }} />

                    <div
                        className="ticker-track"
                        style={{
                            display: "flex", alignItems: "center", height: "100%",
                            width: "max-content",
                            animationPlayState: paused ? "paused" : "running",
                        }}
                    >
                        {loop.map((item, i) => (
                            <a
                                key={i}
                                href={`/article/${item.slug}`}
                                style={{
                                    display: "flex", alignItems: "center", gap: "1rem",
                                    padding: "0 2.4rem",
                                    borderRight: "1px solid #e8ebed",
                                    textDecoration: "none", height: "100%",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = "#f9fafb";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                                }}
                            >
                                {/* Thumbnail */}
                                <div style={{
                                    width: "3.6rem", height: "3.6rem",
                                    borderRadius: "0.4rem", overflow: "hidden",
                                    flexShrink: 0, backgroundColor: "#e8ebed",
                                }}>
                                    <img
                                        src={item.image} alt=""
                                        width={36} height={36}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                    />
                                </div>

                                {/* Text */}
                                <div style={{ minWidth: 0 }}>
                                    <p style={{
                                        fontFamily: f, fontWeight: 700, fontSize: "1.25rem",
                                        color: "#1a1a1a", lineHeight: 1.3, margin: 0,
                                        whiteSpace: "nowrap",
                                    }}>
                                        {item.title}
                                    </p>
                                    <span style={{
                                        fontFamily: f, fontSize: "1.05rem",
                                        color: "#99989f", display: "block", marginTop: "0.2rem",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {item.date}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Pause / Play */}
                <button
                    onClick={() => setPaused(p => !p)}
                    aria-label={paused ? "Play" : "Pause"}
                    style={{
                        flexShrink: 0, width: "5rem",
                        backgroundColor: "transparent", border: "none",
                        borderLeft: "1px solid #e8ebed",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        color: paused ? "#e9173d" : "#99989f",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#1a1a1a")}
                    onMouseLeave={e => (e.currentTarget.style.color = paused ? "#e9173d" : "#99989f")}
                >
                    {paused ? (
                        <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
                            <path d="M1 1l9 5.5-9 5.5V1z" />
                        </svg>
                    ) : (
                        <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
                            <rect x="0.5" y="0.5" width="3" height="12" rx="1" />
                            <rect x="7.5" y="0.5" width="3" height="12" rx="1" />
                        </svg>
                    )}
                </button>

            </div>

            <style>{`
                @keyframes tickerScroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                .ticker-track {
                    animation: tickerScroll 80s linear infinite;
                }
                @keyframes tickerDot {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(233,23,61,0.5); }
                    50%      { box-shadow: 0 0 0 5px rgba(233,23,61,0); }
                }
            `}</style>
        </div>
    );
}
