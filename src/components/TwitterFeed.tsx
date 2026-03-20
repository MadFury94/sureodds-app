"use client";
import { useEffect, useRef, useState } from "react";
import { fonts, colors } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

// ── Dummy tweets shown while Twitter is not yet configured ────────────────
const DUMMY_TWEETS = [
    {
        id: "1",
        author: "Fabrizio Romano",
        handle: "@FabrizioRomano",
        avatar: "https://unavatar.io/twitter/FabrizioRomano",
        time: "2m",
        text: "🚨 OFFICIAL: Transfer confirmed and here we go! Full agreement reached between clubs. Medical scheduled for tomorrow. #HereWeGo",
        image: null,
        likes: 18400,
        retweets: 6200,
    },
    {
        id: "2",
        author: "Sky Sports News",
        handle: "@SkySportsNews",
        avatar: "https://unavatar.io/twitter/SkySportsNews",
        time: "14m",
        text: "BREAKING: Premier League clubs have conceded 30 goals in the Champions League Round of 16 — the most by English sides in a single UCL knockout round. 😳",
        image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&q=80",
        likes: 4100,
        retweets: 1800,
    },
    {
        id: "3",
        author: "OptaJoe",
        handle: "@OptaJoe",
        avatar: "https://unavatar.io/twitter/OptaJoe",
        time: "31m",
        text: "9 - Only 9 players have scored more Premier League goals than Mohamed Salah this season. Inevitable. ⚡",
        image: null,
        likes: 9700,
        retweets: 2300,
    },
    {
        id: "4",
        author: "BBC Sport",
        handle: "@BBCSport",
        avatar: "https://unavatar.io/twitter/BBCSport",
        time: "1h",
        text: "Real Madrid are monitoring the situation of three Premier League midfielders ahead of the summer transfer window, according to reports. 👀",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
        likes: 3200,
        retweets: 890,
    },
    {
        id: "5",
        author: "The Athletic",
        handle: "@TheAthletic",
        avatar: "https://unavatar.io/twitter/TheAthletic",
        time: "2h",
        text: "AFCON 2025: Nigeria, Senegal and Morocco are the early favourites as the draw is confirmed. Full group stage breakdown 🌍👇",
        image: null,
        likes: 2100,
        retweets: 540,
    },
];

function formatCount(n: number) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
    return String(n);
}

interface Tweet {
    id: string;
    author: string;
    handle: string;
    avatar: string;
    time: string;
    text: string;
    image: string | null;
    likes: number;
    retweets: number;
}

function TweetCard({ tweet }: { tweet: Tweet }) {
    return (
        <div style={{
            background: "#fff",
            border: "1px solid #e8ebed",
            borderRadius: "1.2rem",
            padding: "1.6rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            minWidth: "30rem",
            maxWidth: "34rem",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <img
                    src={tweet.avatar}
                    alt={tweet.author}
                    style={{ width: "4rem", height: "4rem", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tweet.author)}&background=e9173d&color=fff`; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: f, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", lineHeight: 1.2 }}>{tweet.author}</p>
                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: colors.gray500, lineHeight: 1.2 }}>{tweet.handle}</p>
                </div>
                {/* X logo */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a" style={{ flexShrink: 0 }}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </div>

            {/* Tweet text */}
            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", lineHeight: 1.55 }}>{tweet.text}</p>

            {/* Image */}
            {tweet.image && (
                <div style={{ borderRadius: "0.8rem", overflow: "hidden", aspectRatio: "16/9" }}>
                    <img src={tweet.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.6rem", paddingTop: "0.4rem", borderTop: "1px solid #f0f0f0" }}>
                {/* Retweet */}
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: f, fontSize: "1.2rem", color: colors.gray500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                        <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                    </svg>
                    {formatCount(tweet.retweets)}
                </span>
                {/* Like */}
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: f, fontSize: "1.2rem", color: colors.gray500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {formatCount(tweet.likes)}
                </span>
                <span style={{ marginLeft: "auto", fontFamily: f, fontSize: "1.2rem", color: colors.gray400 }}>{tweet.time}</span>
            </div>
        </div>
    );
}

interface Props {
    /** Twitter list URL e.g. https://twitter.com/i/lists/123456789 — when set, renders real embed */
    listUrl?: string;
    /** Profile URL e.g. https://twitter.com/sureoddsng — used if no listUrl */
    profileUrl?: string;
    title?: string;
}

export default function TwitterFeed({ listUrl, profileUrl, title = "Latest on X" }: Props) {
    const embedUrl = listUrl ?? profileUrl;
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const scroll = (dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    };

    const onScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 10);
        setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    // Load Twitter widget script when real embed URL is provided
    useEffect(() => {
        if (!embedUrl) return;
        if (document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) return;
        const s = document.createElement("script");
        s.src = "https://platform.twitter.com/widgets.js";
        s.async = true;
        document.body.appendChild(s);
    }, [embedUrl]);

    return (
        <section style={{ backgroundColor: "#f2f5f6", padding: "4rem 0" }}>
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }}>

                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1a1a1a">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {title}
                        </h2>
                    </div>
                    {/* Scroll arrows */}
                    {!embedUrl && (
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                            {[{ dir: "left" as const, d: "M15 18l-6-6 6-6" }, { dir: "right" as const, d: "M9 18l6-6-6-6" }].map(({ dir, d }) => (
                                <button key={dir} onClick={() => scroll(dir)} style={{
                                    width: "3.6rem", height: "3.6rem", borderRadius: "50%",
                                    border: "1px solid #ddd", background: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", opacity: (dir === "left" ? canLeft : canRight) ? 1 : 0.35,
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5">
                                        <path d={d} />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Real Twitter embed */}
                {embedUrl ? (
                    <div style={{ maxWidth: "60rem", margin: "0 auto" }}>
                        <a
                            className="twitter-timeline"
                            data-height="500"
                            data-theme="light"
                            data-chrome="noheader nofooter noborders"
                            href={embedUrl}
                        >
                            Loading tweets...
                        </a>
                    </div>
                ) : (
                    /* Dummy scrollable cards */
                    <div
                        ref={scrollRef}
                        onScroll={onScroll}
                        style={{
                            display: "flex", gap: "1.6rem",
                            overflowX: "auto", paddingBottom: "0.8rem",
                            scrollbarWidth: "none",
                        }}
                        className="scrollbar-hide"
                    >
                        {DUMMY_TWEETS.map(t => <TweetCard key={t.id} tweet={t} />)}
                        {/* "Connect Twitter" CTA card */}
                        <div style={{
                            minWidth: "28rem", maxWidth: "28rem", flexShrink: 0,
                            background: "#fff", border: "2px dashed #ddd", borderRadius: "1.2rem",
                            display: "flex", flexDirection: "column", alignItems: "center",
                            justifyContent: "center", gap: "1.2rem", padding: "2.4rem",
                            textAlign: "center",
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill={colors.gray300}>
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: colors.gray500, lineHeight: 1.5 }}>
                                Connect your X account to show live tweets here
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
