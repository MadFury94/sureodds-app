"use client";
import { useEffect, useState } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Tip { id: string; match: string; tip: string; odds: string; date: string; result?: string; }
interface Post { slug: string; title: string; image: string; date: string; category: string; }
interface UserData { name: string; email: string; subscriptionExpiry: string | null; createdAt: string; }

export default function DashboardHome() {
    const [user, setUser] = useState<UserData | null>(null);
    const [tips, setTips] = useState<Tip[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
        fetch("/api/tips").then(r => r.json()).then(d => setTips((d.tips ?? []).slice(0, 3)));
        fetch(`${process.env.NEXT_PUBLIC_WP_API}/posts?per_page=4&_embed`)
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data)) return;
                setPosts(data.map((p: { slug: string; title: { rendered: string }; date: string; _embedded?: { "wp:featuredmedia"?: Array<{ source_url: string }> }; _links?: { "wp:term"?: Array<{ taxonomy: string; href: string }> } }) => ({
                    slug: p.slug,
                    title: p.title.rendered.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c)),
                    image: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "/fallback.jpg",
                    date: new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                    category: "Football",
                })));
            });
    }, []);

    const daysLeft = user?.subscriptionExpiry
        ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiry).getTime() - Date.now()) / 86400000))
        : 0;

    const card = (children: React.ReactNode, style?: React.CSSProperties) => (
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2rem", ...style }}>{children}</div>
    );

    return (
        <div style={{ maxWidth: "96rem" }}>
            {/* Welcome */}
            <div style={{ marginBottom: "2.4rem" }}>
                <h1 style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.4rem" }}>
                    Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>Here's your daily overview.</p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.6rem", marginBottom: "2.4rem" }}>
                {card(
                    <>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.6rem" }}>Subscription</p>
                        <p style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: daysLeft <= 5 ? "#ff6b00" : "#22c55e", margin: 0 }}>{daysLeft}d</p>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.2rem 0 0" }}>days remaining</p>
                    </>
                )}
                {card(
                    <>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.6rem" }}>Today's Tips</p>
                        <p style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{tips.length}</p>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.2rem 0 0" }}>available</p>
                    </>
                )}
                {card(
                    <>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.6rem" }}>Member Since</p>
                        <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—"}
                        </p>
                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.2rem 0 0" }}>joined</p>
                    </>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {/* Tips preview */}
                {card(
                    <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                            <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em" }}>🎯 Today's Tips</span>
                            <a href="/dashboard/tips" style={{ fontFamily: f, fontSize: "1.2rem", color: "#ff6b00", fontWeight: 700 }}>View all →</a>
                        </div>
                        {tips.length === 0 ? (
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f" }}>No tips posted yet today.</p>
                        ) : tips.map(tip => (
                            <div key={tip.id} style={{ padding: "1.2rem 0", borderBottom: "1px solid #f0f0f0" }}>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.3rem" }}>{tip.match}</p>
                                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                                    <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d" }}>{tip.tip}</span>
                                    <span style={{ padding: "0.2rem 0.7rem", backgroundColor: "#fff7f0", borderRadius: "0.3rem", fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#ff6b00" }}>@ {tip.odds}</span>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Latest posts */}
                {card(
                    <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                            <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em" }}>📰 Latest News</span>
                            <a href="/dashboard/posts" style={{ fontFamily: f, fontSize: "1.2rem", color: "#ff6b00", fontWeight: 700 }}>View all →</a>
                        </div>
                        {posts.map(post => (
                            <a key={post.slug} href={`/article/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: "1.2rem", padding: "1rem 0", borderBottom: "1px solid #f0f0f0", textDecoration: "none" }}>
                                <img src={post.image} alt={post.title} style={{ width: "6rem", height: "4.5rem", objectFit: "cover", borderRadius: "0.4rem", flexShrink: 0 }} />
                                <div>
                                    <p className="clamp2" style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.3rem", lineHeight: 1.3 }}>{post.title}</p>
                                    <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>{post.date}</span>
                                </div>
                            </a>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
