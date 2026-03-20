"use client";
import { useState, useTransition } from "react";
import { decodeTitle, formatDate } from "@/lib/wordpress";
import PageHeader from "@/components/PageHeader";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const badgeColors: Record<string, string> = {
    NFL: "#ff6b00", NBA: "#ff6b00", MLB: "#003087", NHL: "#003087",
    Soccer: "#1a1a1a", Boxing: "#1a1a1a", News: "#68676d",
};

const sports = ["All", "NFL", "NBA", "MLB", "NHL", "Soccer", "Boxing", "MMA"];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&q=80";

interface SearchResult {
    slug: string;
    title: string;
    date: string;
    image: string;
    category: string;
}

async function searchWP(query: string): Promise<SearchResult[]> {
    const base = process.env.NEXT_PUBLIC_WP_API ?? "https://sureodds.ng/wp-json/wp/v2";
    const params = new URLSearchParams({ _embed: "1", per_page: "12" });
    if (query) params.set("search", query);
    const res = await fetch(`${base}/posts?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const posts = await res.json();
    return posts.map((p: any) => ({
        slug: p.slug,
        title: decodeTitle(p.title.rendered),
        date: formatDate(p.date),
        image: p.jetpack_featured_media_url || p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || FALLBACK_IMAGE,
        category: p._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Sports",
    }));
}

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searched, setSearched] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            const data = await searchWP(query);
            setResults(data);
            setSearched(true);
        });
    }

    const filtered = activeFilter === "All"
        ? results
        : results.filter(r => r.category.toLowerCase() === activeFilter.toLowerCase());

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            {/* Black page header */}
            <PageHeader
                title="Search"
                subtitle="Find articles, transfers, match reports and more."
                image="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&q=80"
            />

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>

                {/* Search form */}
                <form onSubmit={handleSearch} style={{ position: "relative", marginBottom: "2.4rem", maxWidth: "64rem", display: "flex", gap: "1.2rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <svg style={{ position: "absolute", left: "1.6rem", top: "50%", transform: "translateY(-50%)", color: "#68676d" }}
                            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search articles, sports, topics..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                width: "100%", padding: "1.4rem 1.6rem 1.4rem 4.8rem",
                                border: "2px solid #e8ebed", borderRadius: "0.8rem",
                                fontFamily: f, fontSize: "1.6rem", color: "#1a1a1a", outline: "none",
                                boxSizing: "border-box",
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#e8ebed")}
                        />
                    </div>
                    <button type="submit" style={{
                        padding: "0 2.4rem", backgroundColor: "#1a1a1a", color: "#fff",
                        border: "none", borderRadius: "0.8rem", fontFamily: f, fontSize: "1.6rem",
                        fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                    }}>
                        {isPending ? "Searching…" : "Search"}
                    </button>
                </form>

                {/* Sport filters */}
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "3.2rem" }}>
                    {sports.map(sport => (
                        <button key={sport} onClick={() => setActiveFilter(sport)} style={{
                            padding: "0.6rem 1.6rem", borderRadius: "2rem",
                            border: `2px solid ${activeFilter === sport ? "#1a1a1a" : "#e8ebed"}`,
                            backgroundColor: activeFilter === sport ? "#1a1a1a" : "#fff",
                            fontFamily: f, fontSize: "1.3rem", fontWeight: 600,
                            color: activeFilter === sport ? "#fff" : "#3d3c41",
                            cursor: "pointer",
                        }}>
                            {sport}
                        </button>
                    ))}
                </div>

                {/* Results */}
                {searched && (
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", marginBottom: "2.4rem" }}>
                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : ""}
                    </p>
                )}

                {filtered.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.84rem" }}>
                        {filtered.map(article => (
                            <a key={article.slug} href={`/article/${article.slug}`} style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                                <div style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem", marginBottom: "1.2rem" }}>
                                    <img src={article.image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <span style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    padding: "0.3rem 0.8rem", borderRadius: "0.2rem",
                                    backgroundColor: badgeColors[article.category] ?? "#68676d",
                                    fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#fff",
                                    textTransform: "uppercase", letterSpacing: "0.08em",
                                    alignSelf: "flex-start", marginBottom: "0.8rem",
                                }}>{article.category}</span>
                                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25, color: "#1a1a1a" }}>
                                    {article.title}
                                </h3>
                                <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.6rem" }}>{article.date}</span>
                            </a>
                        ))}
                    </div>
                ) : searched ? (
                    <div style={{ textAlign: "center", padding: "8rem 0" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>No results found</p>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Try a different search term or browse by sport above.</p>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "8rem 0" }}>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Enter a search term above to find articles.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
