import { fonts, LEAGUE_LOGOS, CATEGORY_COLORS } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

// Icons for non-league sections
const SECTION_ICONS: Record<string, string> = {
    transfer: "🔄",
    "breaking-news": "⚡",
    news: "📰",
    "football-stories": "📖",
    "international-football": "🌍",
};

interface Article {
    image: string;
    category: string;
    title: string;
    slug?: string;
    emoji?: string;
}

interface Props {
    title: string;
    slug?: string; // category slug for logo/icon lookup
    featured: Article;
    grid: [Article, Article, Article, Article];
    reverse?: boolean;
    viewAllHref?: string;
}

function SectionIcon({ slug }: { slug?: string }) {
    if (!slug) return null;
    const logo = LEAGUE_LOGOS[slug];
    const color = CATEGORY_COLORS[slug] ?? "#68676d";
    const icon = SECTION_ICONS[slug];

    if (logo) {
        const isLocal = logo.startsWith("/");
        return (
            <div style={{
                width: "3.2rem", height: "3.2rem", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "0.5rem",
                backgroundColor: isLocal ? color : "transparent",
                padding: isLocal ? "0.4rem" : "0",
            }}>
                <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
        );
    }
    if (icon) {
        return <span style={{ fontSize: "2.4rem", lineHeight: 1, flexShrink: 0 }}>{icon}</span>;
    }
    // Fallback: colored accent bar
    return <span style={{ width: "0.4rem", height: "2.4rem", borderRadius: "0.2rem", backgroundColor: color, flexShrink: 0, display: "inline-block" }} />;
}

export default function SportSection({ title, slug, featured, grid, reverse = false, viewAllHref }: Props) {
    return (
        <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
            <section style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "5rem 1.2rem 5rem" }} className="sport-section-wrap reveal">

                {/* Section title */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <SectionIcon slug={slug} />
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.2rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.03em", margin: 0 }}>
                            {title}
                        </h2>
                    </div>
                    {viewAllHref && (
                        <a href={viewAllHref} style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#ff6b00", textDecoration: "none" }}>
                            View All →
                        </a>
                    )}
                </div>

                {/* 2-col: optionally reversed */}
                <div className="sport-section-grid" style={{ direction: reverse ? "rtl" : "ltr" }}>

                    {/* Featured */}
                    <a href={featured.slug ? `/article/${featured.slug}` : "#"} style={{ display: "flex", flexDirection: "column", textDecoration: "none", direction: "ltr" }} className="card-hover">
                        <div style={{ width: "100%", aspectRatio: "16/10.8", overflow: "hidden", borderRadius: "0.8rem" }} className="img-zoom">
                            <img src={featured.image} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0" }}>
                            {featured.emoji && <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0, marginTop: "0.2rem" }}>{featured.emoji}</span>}
                            <h3 className="title-featured" style={{ fontFamily: f }}>
                                {featured.title}
                            </h3>
                        </div>
                    </a>

                    {/* 2×2 grid */}
                    <div className="sport-section-subgrid" style={{ direction: "ltr" }}>
                        {grid.map((article, i) => (
                            <a key={i} href={article.slug ? `/article/${article.slug}` : "#"} style={{ display: "flex", flexDirection: "column", textDecoration: "none" }} className="card-hover">
                                <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }} className="img-zoom">
                                    <img src={article.image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0" }}>
                                    {article.emoji && <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0, marginTop: "0.1rem" }}>{article.emoji}</span>}
                                    <p className="clamp2 title-card" style={{ fontFamily: f }}>
                                        {article.title}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>

                </div>
            </section>
        </div>
    );
}
