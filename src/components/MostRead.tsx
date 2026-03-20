"use client";
import { useRef, useState } from "react";
import { colors, fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface MostReadItem {
    num: number;
    title: string;
    image: string;
    slug: string;
}

const fallbackItems: MostReadItem[] = [
    { num: 1, title: "New Mock for March Madness 🗒️", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80", slug: "#" },
    { num: 2, title: "Latest Signings and Trades 🧢", image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80", slug: "#" },
    { num: 3, title: "Post-Combine Mock 🏈", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80", slug: "#" },
    { num: 4, title: "Fresh NBA Power Rankings 📊", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80", slug: "#" },
];

export default function MostRead({ posts }: { posts?: MostReadItem[] }) {
    const items = (posts && posts.length > 0) ? posts : fallbackItems;

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
        <section style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)", padding: "5rem 0" }} className="most-read-section">
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                    <span style={{ fontFamily: f, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        Most Read <span style={{ fontSize: "1.4rem" }}>✏️</span>
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

                <div ref={scrollRef} onScroll={onScroll} className="scrollbar-hide" style={{ overflowX: "auto" }}>
                    <div className="most-read-track">
                        {items.map((item) => (
                            <a key={item.num} href={`/article/${item.slug}`} className="most-read-card">
                                <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }}>
                                    <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "0.8rem 0 0" }}>
                                    <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#99989f", flexShrink: 0, lineHeight: 1 }}>
                                        {item.num}
                                    </span>
                                    <span className="clamp2 title-card" style={{ fontFamily: f }}>
                                        {item.title}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
