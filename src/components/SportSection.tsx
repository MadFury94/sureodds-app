const f = '"Proxima Nova", Arial, sans-serif';

interface Article {
    image: string;
    category: string;
    title: string;
    emoji?: string;
}

interface Props {
    title: string;
    featured: Article;
    grid: [Article, Article, Article, Article];
}

export default function SportSection({ title, featured, grid }: Props) {
    return (
        <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
            <section style={{ maxWidth: "144rem", margin: "0 auto", padding: "2.4rem 2rem 3.2rem" }}>

                {/* Section title */}
                <h2 style={{ fontFamily: f, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", marginBottom: "1.6rem" }}>
                    {title}
                </h2>

                {/* 2-col: big featured left | 2×2 grid right */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.26rem", alignItems: "start" }}>

                    {/* Featured — same as hero center */}
                    <a href="#" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }}>
                            <img src={featured.image} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0" }}>
                            {featured.emoji && <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0, marginTop: "0.2rem" }}>{featured.emoji}</span>}
                            <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2, color: "#1a1a1a" }}>
                                {featured.title}
                            </h3>
                        </div>
                    </a>

                    {/* 2×2 grid — same as hero left thumb cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.26rem" }}>
                        {grid.map((article, i) => (
                            <a key={i} href="#" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                                <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem" }}>
                                    <img src={article.image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem 0 0" }}>
                                    {article.emoji && <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0, marginTop: "0.1rem" }}>{article.emoji}</span>}
                                    <p className="clamp2" style={{ fontFamily: f, fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25, color: "#1a1a1a" }}>
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
