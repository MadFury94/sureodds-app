"use client";
import { useState, useEffect } from "react";
import { fonts } from "@/lib/config";
import PhoneMarquee from "@/components/PhoneMarquee";

const f = fonts.body;
const fd = fonts.display;

const SPORTS_IMAGES = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
];

interface WPPost {
    id: number;
    slug: string;
    date: string;
    title: { rendered: string };
    _embedded?: { "wp:featuredmedia"?: Array<{ source_url?: string }> };
}

function getFeaturedImage(post: WPPost): string {
    return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
        ?? "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&q=70";
}

function decodeTitle(html: string): string {
    if (typeof document === "undefined") return html;
    const el = document.createElement("div");
    el.innerHTML = html;
    return el.textContent ?? html;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
    const [posts, setPosts] = useState<WPPost[]>([]);
    const [totalCats, setTotalCats] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const WP_API = process.env.NEXT_PUBLIC_WP_API;
        Promise.all([
            fetch(`${WP_API}/posts?per_page=10&_embed=1`).then(r => r.json()).catch(() => []),
            fetch(`${WP_API}/categories?per_page=100`).then(r => r.json()).catch(() => []),
        ]).then(([p, c]) => {
            setPosts(Array.isArray(p) ? p : []);
            setTotalCats(Array.isArray(c) ? c.length : 0);
        }).finally(() => setLoading(false));
    }, []);

    const recentPosts = posts.slice(0, 5);

    const stats = [
        { label: "Total Posts", value: loading ? "…" : posts.length, icon: "📝", color: "#ff6b00" },
        { label: "Categories", value: loading ? "…" : totalCats, icon: "◈", color: "#1a1f71" },
        { label: "Published", value: loading ? "…" : posts.length, icon: "✅", color: "#22c55e" },
        { label: "Media Files", value: "—", icon: "🖼", color: "#f59e0b" },
    ];

    return (
        <div>
            {/* Welcome banner */}
            <div style={{
                borderRadius: "1.2rem", overflow: "hidden",
                marginBottom: "2.4rem", position: "relative", minHeight: "18rem",
                display: "flex", alignItems: "flex-end",
            }}>
                <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=80"
                    alt=""
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%)",
                }} />
                <div style={{ position: "relative", zIndex: 1, padding: "3.2rem" }}>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "rgba(255,255,255,0.6)", margin: "0 0 0.4rem" }}>
                        Welcome back 👋
                    </p>
                    <h1 style={{ fontFamily: fd, fontWeight: 700, fontSize: "3.2rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 1.6rem" }}>
                        Sureodds Admin
                    </h1>
                    <a href="/admin-dashboard/new-post" style={{
                        display: "inline-flex", alignItems: "center", gap: "0.6rem",
                        padding: "1rem 2.4rem", backgroundColor: "#ff6b00",
                        color: "#fff", borderRadius: "0.6rem",
                        fontFamily: f, fontWeight: 700, fontSize: "1.4rem",
                        textDecoration: "none",
                    }}>
                        ✎ Write New Post
                    </a>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.6rem", marginBottom: "2.4rem" }} className="admin-stats-grid">
                {stats.map(s => (
                    <div key={s.label} style={{
                        backgroundColor: "#fff", borderRadius: "1rem",
                        padding: "2rem", border: "1.5px solid #e8ebed",
                        display: "flex", alignItems: "center", gap: "1.6rem",
                    }}>
                        <div style={{
                            width: "4.8rem", height: "4.8rem", borderRadius: "1rem",
                            backgroundColor: s.color + "18",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2.2rem", flexShrink: 0,
                        }}>{s.icon}</div>
                        <div>
                            <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.8rem", color: "#1a1a1a", margin: 0, lineHeight: 1 }}>{s.value}</p>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0.3rem 0 0" }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-col: recent posts + quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 32rem", gap: "2rem", marginBottom: "2.4rem" }} className="admin-two-col">

                {/* Recent posts */}
                <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                    <div style={{ padding: "1.8rem 2rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.5rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Recent Posts</h2>
                        <a href="/admin-dashboard/posts" style={{ fontFamily: f, fontSize: "1.2rem", color: "#ff6b00", textDecoration: "none", fontWeight: 600 }}>View all →</a>
                    </div>
                    {loading ? (
                        <div style={{ padding: "4rem", textAlign: "center" }}>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>Loading…</p>
                        </div>
                    ) : recentPosts.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center" }}>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>No posts yet. <a href="/admin-dashboard/new-post" style={{ color: "#ff6b00" }}>Write your first post →</a></p>
                        </div>
                    ) : (
                        <div>
                            {recentPosts.map((post, i) => (
                                <div key={post.id} style={{
                                    display: "flex", alignItems: "center", gap: "1.4rem",
                                    padding: "1.4rem 2rem",
                                    borderBottom: i < recentPosts.length - 1 ? "1px solid #f0f0f0" : "none",
                                }}>
                                    <img
                                        src={getFeaturedImage(post)}
                                        alt=""
                                        style={{ width: "5.6rem", height: "4rem", objectFit: "cover", borderRadius: "0.5rem", flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontFamily: f, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a",
                                            margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>{decodeTitle(post.title.rendered)}</p>
                                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.2rem 0 0" }}>{formatDate(post.date)}</p>
                                    </div>
                                    <a href={`/article/${post.slug}`} target="_blank" style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", textDecoration: "none", flexShrink: 0 }}>↗</a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick actions + sports images */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", padding: "2rem" }}>
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.5rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1.6rem" }}>Quick Actions</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {[
                                { label: "✎  New Post", href: "/admin-dashboard/new-post", bg: "#ff6b00" },
                                { label: "🎯  Add Betting Tip", href: "/admin-dashboard/tips", bg: "#1a1a1a" },
                                { label: "🖼  Upload Media", href: "/admin-dashboard/media", bg: "#1a1f71" },
                                { label: "◈  Categories", href: "/admin-dashboard/categories", bg: "#009a44" },
                            ].map(a => (
                                <a key={a.label} href={a.href} className="quick-action-btn" style={{
                                    display: "block", padding: "1.1rem 1.6rem",
                                    backgroundColor: a.bg, color: "#fff",
                                    borderRadius: "0.6rem", textDecoration: "none",
                                    fontFamily: f, fontWeight: 700, fontSize: "1.3rem",
                                    transition: "opacity 0.15s",
                                }}>{a.label}</a>
                            ))}
                        </div>
                    </div>

                    {/* Sports image grid */}
                    <div style={{ borderRadius: "1rem", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                        {SPORTS_IMAGES.slice(0, 4).map((src, i) => (
                            <div key={i} className="img-zoom" style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PhoneMarquee preview */}
            <div style={{ borderRadius: "1.2rem", overflow: "hidden", border: "1.5px solid #e8ebed" }}>
                <div style={{ padding: "1.4rem 2rem", backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0" }}>
                    <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.5rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        Live Site Preview — Betting Tips Marquee
                    </h2>
                </div>
                <PhoneMarquee showHeading={false} />
            </div>
        </div>
    );
}
