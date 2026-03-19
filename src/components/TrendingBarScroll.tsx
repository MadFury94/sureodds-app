"use client";
import { useEffect, useRef, useState } from "react";

interface Item { title: string; slug: string; }

export default function TrendingBarScroll({ items }: { items: Item[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [idx, setIdx] = useState(0);

    // Auto-scroll through headlines every 4s on mobile, free-scroll on desktop
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const timer = setInterval(() => {
            setIdx(prev => {
                const next = (prev + 1) % items.length;
                const children = el.children;
                if (children[next]) {
                    (children[next] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                }
                return next;
            });
        }, 4000);
        return () => clearInterval(timer);
    }, [items.length]);

    return (
        <div style={{ backgroundColor: "#e9173d", display: "flex", alignItems: "center", height: "3.2rem", overflow: "hidden" }}>
            <div style={{
                flexShrink: 0, backgroundColor: "#b60122",
                height: "100%", display: "flex", alignItems: "center",
                padding: "0 1.2rem",
                fontFamily: '"Proxima Nova", Arial, sans-serif',
                fontWeight: 700, fontSize: "1.1rem",
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#fff", whiteSpace: "nowrap",
            }}>
                Latest
            </div>
            <div
                ref={scrollRef}
                className="scrollbar-hide"
                style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", flex: 1 }}
            >
                {items.map((item, i) => (
                    <a
                        key={i}
                        href={`/article/${item.slug}`}
                        style={{
                            flexShrink: 0, color: "#fff",
                            fontFamily: '"Proxima Nova", Arial, sans-serif',
                            fontWeight: 600, fontSize: "1.2rem",
                            whiteSpace: "nowrap", padding: "0 1.6rem",
                            borderRight: "1px solid rgba(255,255,255,0.25)",
                            textDecoration: "none",
                            opacity: i === idx ? 1 : 0.8,
                            transition: "opacity 0.3s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = i === idx ? "1" : "0.8")}
                    >
                        {item.title}
                    </a>
                ))}
            </div>
        </div>
    );
}
