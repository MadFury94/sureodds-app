"use client";
import { colors, fonts, CATEGORY_COLORS } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Article {
    image: string;
    category: string;
    title: string;
    slug: string;
}

interface Headline {
    category: string;
    title: string;
    slug: string;
    logo?: string;
}

interface Props {
    heroPost: Article | null;
    leftPosts: Article[];
    topHeadlines: Headline[];
}

const badgeColors: Record<string, string> = {
    NFL: "#e9173d", NBA: "#e9173d", MLB: "#003087", NHL: "#003087",
    Soccer: "#1a1a1a", Boxing: "#1a1a1a",
};

const fallbackImage = "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=900&q=80";
const fallbackLeft = [
    { image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", category: "NBA", title: "Final Takeaways from WBC", slug: "#" },
    { image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80", category: "Soccer", title: "Every Team's Biggest X-Factor", slug: "#" },
];
const fallbackHeadlines = [
    { category: "NFL", title: "Peterson Responds to Stephen A. Smith", slug: "#", logo: undefined },
    { category: "Boxing", title: "Rory Unveils Masters Dinner Menu", slug: "#", logo: undefined },
    { category: "NBA", title: "WNBA Agrees to New CBA", slug: "#", logo: undefined },
    { category: "MLB", title: "Judge Pissed About WBC Loss", slug: "#", logo: undefined },
    { category: "Soccer", title: "Latest Dolphins Trade Report", slug: "#", logo: undefined },
    { category: "NFL", title: "Fill Out Your Bracket Here", slug: "#", logo: undefined },
];

export default function HeroSection({ heroPost, leftPosts, topHeadlines }: Props) {
    const hero = heroPost ?? { image: fallbackImage, category: "NFL", title: "Biggest FA Overreactions", slug: "#" };
    const left = leftPosts.length >= 1 ? leftPosts.slice(0, 2) : fallbackLeft;
    const headlines = topHeadlines.length >= 1 ? topHeadlines.slice(0, 6) : fallbackHeadlines;

    return (
        <section className="hero-section">

            {/* Left col — 2 stacked thumb cards */}
            <div className="hero-left">
                {left.map((c, i) => (
                    <a key={i} href={`/article/${c.slug}`} style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                        <div style={{ width: "100%", aspectRatio: "4/2.295", overflow: "hidden", borderRadius: "0.8rem" }}>
                            <img src={c.image} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0" }}>
                            <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: "1.8rem", height: "1.8rem", borderRadius: "0.2rem", flexShrink: 0,
                                backgroundColor: badgeColors[c.category] ?? "#68676d",
                            }}>
                                <span style={{ fontFamily: f, fontSize: "0.8rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                                    {c.category.slice(0, 2).toUpperCase()}
                                </span>
                            </span>
                            <p className="clamp2 title-card" style={{ fontFamily: f }}>
                                {c.title}
                            </p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Center — big hero */}
            <a href={`/article/${hero.slug}`} className="hero-center" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }}>
                    <img src={hero.image} alt={hero.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0", flexShrink: 0 }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "2rem", height: "2rem", borderRadius: "0.2rem", flexShrink: 0, marginTop: "0.2rem",
                        backgroundColor: badgeColors[hero.category] ?? "#68676d",
                    }}>
                        <span style={{ fontFamily: f, fontSize: "0.9rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                            {hero.category.slice(0, 2).toUpperCase()}
                        </span>
                    </span>
                    <h2 className="title-featured" style={{ fontFamily: f }}>
                        {hero.title}
                    </h2>
                </div>
            </a>

            {/* Right col — TOP HEADLINES */}
            <div className="hero-headlines">
                <p style={{
                    fontFamily: fd, fontWeight: 700, fontSize: "1.6rem",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    color: "#1a1a1a", marginBottom: "0.6rem",
                }}>
                    Top Headlines
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {headlines.map((h, i) => {
                        const bg = badgeColors[h.category] ?? "#68676d";
                        return (
                            <a key={i} href={`/article/${h.slug}`} style={{
                                display: "flex", alignItems: "flex-start", gap: "0.8rem",
                                padding: "0.75rem 0",
                                borderBottom: i < headlines.length - 1 ? "1px solid #e8e8e8" : "none",
                                textDecoration: "none",
                            }}>
                                {h.logo ? (
                                    <div style={{
                                        width: "2.4rem", height: "2.4rem", flexShrink: 0,
                                        marginTop: "0.2rem", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        // Local SVGs (AFCON etc.) need a coloured bg to be visible
                                        ...(h.logo.startsWith("/") && {
                                            backgroundColor: CATEGORY_COLORS[h.category.toLowerCase().replace(/\s+/g, "-")] ?? colors.gray500,
                                            borderRadius: "0.2rem",
                                            padding: "0.2rem",
                                        }),
                                    }}>
                                        <img src={h.logo} alt={h.category}
                                            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                    </div>
                                ) : (
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        width: "2.2rem", height: "2.2rem", borderRadius: "0.2rem",
                                        backgroundColor: bg, flexShrink: 0, marginTop: "0.2rem",
                                    }}>
                                        <span style={{ fontFamily: f, fontSize: "0.9rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                                            {h.category.slice(0, 2).toUpperCase()}
                                        </span>
                                    </span>
                                )}
                                <span className="clamp2 title-headline" style={{ fontFamily: f }}>
                                    {h.title}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>

        </section>
    );
}
