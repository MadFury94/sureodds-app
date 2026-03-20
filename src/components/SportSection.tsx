import { colors, fonts } from "@/lib/config";

const f = fonts.body;

interface Article {
    image: string;
    category: string;
    title: string;
    slug?: string;
    emoji?: string;
}

interface Props {
    title: string;
    featured: Article;
    grid: [Article, Article, Article, Article];
    reverse?: boolean;
    viewAllHref?: string;
}

export default function SportSection({ title, featured, grid, reverse = false, viewAllHref }: Props) {
    return (
        <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
            <section style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "5rem 1.2rem 5rem" }} className="sport-section-wrap">

                {/* Section title */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                    <h2 style={{ fontFamily: f, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a" }}>
                        {title}
                    </h2>
                    {viewAllHref && (
                        <a href={viewAllHref} style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#e9173d", textDecoration: "none" }}>
                            View All →
                        </a>
                    )}
                </div>

                {/* 2-col: optionally reversed */}
                <div className="sport-section-grid" style={{ direction: reverse ? "rtl" : "ltr" }}>

                    {/* Featured */}
                    <a href={featured.slug ? `/article/${featured.slug}` : "#"} style={{ display: "flex", flexDirection: "column", textDecoration: "none", direction: "ltr" }}>
                        <div style={{ width: "100%", aspectRatio: "16/10.8", overflow: "hidden", borderRadius: "0.8rem" }}>
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
                            <a key={i} href={article.slug ? `/article/${article.slug}` : "#"} style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                                <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }}>
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
