"use client";
import { useState, useEffect, useCallback } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const WP_API = process.env.NEXT_PUBLIC_WP_API;
const PAGE_SIZE = 25;

interface WPPost {
    id: number;
    slug: string;
    date: string;
    title: { rendered: string };
    categories: number[];
    _embedded?: {
        "wp:featuredmedia"?: Array<{ source_url?: string }>;
        "wp:term"?: Array<Array<{ id: number; name: string }>>;
    };
}

function getFeaturedImage(post: WPPost): string {
    return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
        ?? "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=200&q=60";
}

function getCategory(post: WPPost): string {
    return post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Uncategorized";
}

function decodeTitle(html: string): string {
    if (typeof document === "undefined") return html;
    const el = document.createElement("div");
    el.innerHTML = html;
    return el.textContent ?? html;
}

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostsPage() {
    const [posts, setPosts] = useState<WPPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState("Loading posts…");
    const [page, setPage] = useState(1);
    const [autoStatus, setAutoStatus] = useState<string | null>(null);
    const [autoBusy, setAutoBusy] = useState(false);

    const loadAllPosts = useCallback(async () => {
        setLoading(true);
        setLoadingMsg("Fetching page 1…");
        try {
            const all: WPPost[] = [];
            let currentPage = 1;
            let totalPages = 1;
            do {
                const res = await fetch(
                    `${WP_API}/posts?per_page=100&page=${currentPage}&_embed=1`,
                    { cache: "no-store" }
                );
                if (!res.ok) break;
                totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
                const batch: WPPost[] = await res.json();
                all.push(...batch);
                if (currentPage < totalPages) {
                    setLoadingMsg(`Fetching page ${currentPage + 1} of ${totalPages}…`);
                }
                currentPage++;
            } while (currentPage <= totalPages);
            setPosts(all);
        } catch {
            // silently fail — show empty state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAllPosts(); }, [loadAllPosts]);

    async function handleAutoCategorize() {
        setAutoBusy(true);
        setAutoStatus("Running…");
        try {
            const ids = posts.map(p => p.id);
            const res = await fetch("/api/auto-categorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postIds: ids }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setAutoStatus(`✓ Updated ${data.updated} posts, skipped ${data.skipped}`);
            // Refresh to show new categories
            await loadAllPosts();
        } catch (e: unknown) {
            setAutoStatus(`✗ ${e instanceof Error ? e.message : "Error"}`);
        } finally {
            setAutoBusy(false);
            setTimeout(() => setAutoStatus(null), 5000);
        }
    }

    const totalPages = Math.ceil(posts.length / PAGE_SIZE);
    const pagePosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div>
            <style>{`.posts-row:hover { background-color: #fafafa !important; }`}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.4rem", flexWrap: "wrap", gap: "1.2rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        All Posts
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: "0.4rem 0 0" }}>
                        {loading ? loadingMsg : `${posts.length} posts`}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                    {autoStatus && (
                        <span style={{
                            fontFamily: f, fontSize: "1.3rem",
                            color: autoStatus.startsWith("✓") ? "#16a34a" : autoStatus.startsWith("✗") ? "#ff6b00" : "#68676d",
                            padding: "0.6rem 1.2rem", backgroundColor: "#f2f5f6", borderRadius: "0.6rem",
                        }}>{autoStatus}</span>
                    )}
                    <button
                        onClick={handleAutoCategorize}
                        disabled={autoBusy || loading}
                        style={{
                            padding: "1rem 1.8rem", backgroundColor: "#1a1a1a", color: "#fff",
                            border: "none", borderRadius: "0.6rem",
                            fontFamily: f, fontWeight: 700, fontSize: "1.3rem",
                            cursor: autoBusy || loading ? "not-allowed" : "pointer",
                            opacity: autoBusy || loading ? 0.6 : 1,
                        }}
                    >
                        {autoBusy ? "Running…" : "⚡ Auto-Categorize"}
                    </button>
                    <a href="/admin-dashboard/new-post" style={{
                        padding: "1rem 2rem", backgroundColor: "#ff6b00", color: "#fff",
                        borderRadius: "0.6rem", fontFamily: f, fontWeight: 700, fontSize: "1.3rem",
                        textDecoration: "none",
                    }}>+ New Post</a>
                </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                {/* Table header */}
                <div style={{
                    display: "grid", gridTemplateColumns: "6rem 1fr 16rem 12rem 10rem",
                    padding: "1.2rem 2rem", backgroundColor: "#f9f9f9",
                    borderBottom: "1px solid #e8ebed",
                }}>
                    {["", "Title", "Category", "Date", ""].map((h, i) => (
                        <span key={i} style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                    ))}
                </div>

                {loading ? (
                    // Skeleton rows
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{
                            display: "grid", gridTemplateColumns: "6rem 1fr 16rem 12rem 10rem",
                            padding: "1.4rem 2rem", alignItems: "center",
                            borderBottom: "1px solid #f0f0f0",
                        }}>
                            <div style={{ width: "5.2rem", height: "3.6rem", borderRadius: "0.4rem", backgroundColor: "#f0f0f0" }} />
                            <div style={{ height: "1.4rem", backgroundColor: "#f0f0f0", borderRadius: "0.3rem", width: "70%", marginRight: "1.6rem" }} />
                            <div style={{ height: "1.4rem", backgroundColor: "#f0f0f0", borderRadius: "0.3rem", width: "60%" }} />
                            <div style={{ height: "1.4rem", backgroundColor: "#f0f0f0", borderRadius: "0.3rem", width: "50%" }} />
                            <div />
                        </div>
                    ))
                ) : pagePosts.length === 0 ? (
                    <div style={{ padding: "6rem", textAlign: "center" }}>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>
                            No posts found. <a href="/admin-dashboard/new-post" style={{ color: "#ff6b00" }}>Write your first post →</a>
                        </p>
                    </div>
                ) : pagePosts.map((post, i) => (
                    <div key={post.id} className="posts-row" style={{
                        display: "grid", gridTemplateColumns: "6rem 1fr 16rem 12rem 10rem",
                        padding: "1.4rem 2rem", alignItems: "center",
                        borderBottom: i < pagePosts.length - 1 ? "1px solid #f0f0f0" : "none",
                        transition: "background 0.1s",
                    }}>
                        <img
                            src={getFeaturedImage(post)}
                            alt=""
                            style={{ width: "5.2rem", height: "3.6rem", objectFit: "cover", borderRadius: "0.4rem" }}
                        />
                        <div style={{ paddingRight: "1.6rem" }}>
                            <a
                                href={`/admin-dashboard/edit-post/${post.id}`}
                                style={{ fontFamily: f, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                                title="Edit post"
                            >
                                {decodeTitle(post.title.rendered)}
                            </a>
                        </div>
                        <span style={{
                            display: "inline-block", padding: "0.3rem 0.8rem", borderRadius: "0.3rem",
                            backgroundColor: "#f2f5f6", fontFamily: f, fontSize: "1.2rem", color: "#3d3c41",
                        }}>{getCategory(post)}</span>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>{formatDate(post.date)}</span>
                        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                            <a
                                href={`/admin-dashboard/edit-post/${post.id}`}
                                style={{
                                    fontFamily: f, fontSize: "1.2rem", fontWeight: 600,
                                    color: "#fff", backgroundColor: "#1a1a1a",
                                    padding: "0.4rem 1rem", borderRadius: "0.4rem",
                                    textDecoration: "none",
                                }}
                            >Edit</a>
                            <a
                                href={`/article/${post.slug}`}
                                target="_blank"
                                style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", textDecoration: "none" }}
                                title="View post"
                            >↗</a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", marginTop: "2.4rem", flexWrap: "wrap" }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            padding: "0.8rem 1.6rem", border: "1.5px solid #e8ebed",
                            borderRadius: "0.6rem", backgroundColor: "#fff",
                            fontFamily: f, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a",
                            cursor: page === 1 ? "not-allowed" : "pointer",
                            opacity: page === 1 ? 0.4 : 1,
                        }}
                    >← Prev</button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, i) =>
                            p === "…" ? (
                                <span key={`ellipsis-${i}`} style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f", padding: "0 0.4rem" }}>…</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => setPage(p as number)}
                                    style={{
                                        padding: "0.8rem 1.4rem", border: "1.5px solid",
                                        borderColor: page === p ? "#1a1a1a" : "#e8ebed",
                                        borderRadius: "0.6rem",
                                        backgroundColor: page === p ? "#1a1a1a" : "#fff",
                                        fontFamily: f, fontWeight: 700, fontSize: "1.3rem",
                                        color: page === p ? "#fff" : "#1a1a1a",
                                        cursor: "pointer",
                                    }}
                                >{p}</button>
                            )
                        )}

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                            padding: "0.8rem 1.6rem", border: "1.5px solid #e8ebed",
                            borderRadius: "0.6rem", backgroundColor: "#fff",
                            fontFamily: f, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a",
                            cursor: page === totalPages ? "not-allowed" : "pointer",
                            opacity: page === totalPages ? 0.4 : 1,
                        }}
                    >Next →</button>

                    <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginLeft: "0.8rem" }}>
                        Page {page} of {totalPages}
                    </span>
                </div>
            )}
        </div>
    );
}
