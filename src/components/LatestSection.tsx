"use client";
import { useRef, useState } from "react";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

interface LatestPost {
    slug: string;
    title: string;
    image: string;
    category: string;
    date: string;
}

interface Props {
    posts: LatestPost[];
}

const badgeColors: Record<string, string> = {
    News: "#e9173d", Transfer: "#e9173d", "Breaking News": "#e9173d",
    "La Liga": "#003087", EPL: "#003087", UCL: "#6b21a8",
    AFCON: "#1a6b3c", "Football Stories": "#1a1a1a", Blog: "#68676d",
};

export default function LatestSection({ posts }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);
    const [hovered, setHovered] = useState<string | null>(null);

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
        <section style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)", padding: "5rem 0" }}>
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Latest
                        </span>
                        {/* Live pulse dot */}
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{
                                width: "0.8rem", height: "0.8rem", borderRadius: "50%",
                                backgroundColor: "#e9173d",
                                boxShadow: "0 0 0 0 rgba(233,23,61,0.4)",
                                animation: "livePulse 1.6s ease-in-out infinite",
                                display: "inline-block",
                            }} />
                            <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#e9173d", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live</span>
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
                        <a href="/category/news" style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#e9173d", textDecoration: "none" }}>
                            View All →
                        </a>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                            <button onClick={() => scroll(-1)} disabled={!canLeft} style={{ ...arrowStyle, opacity: canLeft ? 1 : 0.35 }} aria-label="Previous">
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M7 1L1 7l6 6" /></svg>
                            </button>
                            <button onClick={() => scroll(1)} disabled={!canRight} style={{ ...arrowStyle, opacity: canRight ? 1 : 0.35 }} aria-label="Next">
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M1 1l6 6-6 6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable cards */}
                <div ref={scrollRef} onScroll={onScroll} className="scrollbar-hide" style={{ overflowX: "auto" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${posts.length}, calc((132.48rem - 2.4rem - 3 * 2.84rem) / 4))`,
                        gap: "2.84rem",
                        width: "max-content", minWidth: "100%",
                    }}>
                        {posts.map((post) => {
                            const isHovered = hovered === post.slug;
                            const color = badgeColors[post.category] ?? "#68676d";
                            return (
                                <a
                                    key={post.slug}
                                    href={`/article/${post.slug}`}
                                    onMouseEnter={() => setHovered(post.slug)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}
                                >
                                    {/* Image with play overlay */}
                                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }}>
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            style={{
                                                width: "100%", height: "100%", objectFit: "cover",
                                                transform: isHovered ? "scale(1.04)" : "scale(1)",
                                                transition: "transform 0.35s ease",
                                            }}
                                        />
                                        {/* Dark overlay */}
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            background: isHovered
                                                ? "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)"
                                                : "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 60%)",
                                            transition: "background 0.25s ease",
                                        }} />
                                        {/* Play button */}
                                        <div style={{
                                            position: "absolute", top: "50%", left: "50%",
                                            transform: `translate(-50%, -50%) scale(${isHovered ? 1.1 : 1})`,
                                            transition: "transform 0.25s ease, opacity 0.25s ease",
                                            opacity: isHovered ? 1 : 0.75,
                                        }}>
                                            <div style={{
                                                width: "4.8rem", height: "4.8rem", borderRadius: "50%",
                                                backgroundColor: "rgba(255,255,255,0.95)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                                            }}>
                                                {/* Play triangle */}
                                                <svg width="16" height="18" viewBox="0 0 16 18" fill="#1a1a1a">
                                                    <path d="M1 1l14 8-14 8V1z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Category badge bottom-left */}
                                        <div style={{ position: "absolute", bottom: "1rem", left: "1rem" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center",
                                                padding: "0.3rem 0.8rem", borderRadius: "0.2rem",
                                                backgroundColor: color,
                                                fontFamily: f, fontSize: "1rem", fontWeight: 700,
                                                color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em",
                                            }}>{post.category}</span>
                                        </div>
                                    </div>

                                    {/* Title + date */}
                                    <div style={{ padding: "1rem 0 0" }}>
                                        <p className="clamp2" style={{
                                            fontFamily: f, fontSize: "1.75rem", fontWeight: 700,
                                            color: "#1a1a1a", lineHeight: 1.25, marginBottom: "0.5rem",
                                        }}>
                                            {post.title}
                                        </p>
                                        <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>{post.date}</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes livePulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(233,23,61,0.5); }
                    50% { box-shadow: 0 0 0 6px rgba(233,23,61,0); }
                }
            `}</style>
        </section>
    );
}
