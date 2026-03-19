import { getCategoryBySlug, getPosts, getFeaturedImage, getPostCategory, formatDate, decodeTitle, WPPost } from "@/lib/wordpress";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const badgeColors: Record<string, string> = {
    nfl: "#e9173d", nba: "#e9173d", mlb: "#003087", nhl: "#003087",
    soccer: "#1a1a1a", boxing: "#1a1a1a", mma: "#1a1a1a", news: "#68676d",
};

const sportEmojis: Record<string, string> = {
    nfl: "🏈", nba: "🏀", mlb: "⚾", nhl: "🏒",
    soccer: "⚽", boxing: "🥊", mma: "🥋", news: "📰",
};

export default async function CategoryPage({ params }: { params: Promise<{ sport: string }> }) {
    const { sport: rawSport } = await params;
    const sport = rawSport.toLowerCase();
    const label = sport.toUpperCase();
    const color = badgeColors[sport] ?? "#68676d";
    const emoji = sportEmojis[sport] ?? "🏅";

    // Try to find the WP category by slug, then fetch its posts
    let posts: WPPost[] = [];
    let totalCount = 0;
    try {
        const cat = await getCategoryBySlug(sport);
        if (cat) {
            totalCount = cat.count;
            posts = await getPosts({ categoryId: cat.id, perPage: 12 });
        } else {
            // No matching category — fetch latest posts as fallback
            posts = await getPosts({ perPage: 12 });
        }
    } catch { /* ignore */ }

    const [featured, ...rest] = posts;

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            {/* Black page header */}
            <div style={{ backgroundColor: "#1a1a1a", padding: "3.2rem 1.2rem" }}>
                <div style={{ maxWidth: "132.48rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "1.2rem" }}>
                    <span style={{ fontSize: "4rem" }}>{emoji}</span>
                    <h1 style={{ fontFamily: fd, fontWeight: 700, fontSize: "4rem", color: "#fff" }}>{label}</h1>
                    {totalCount > 0 && (
                        <span style={{ marginLeft: "auto", fontFamily: f, fontSize: "1.4rem", color: "#aaa" }}>
                            {totalCount} articles
                        </span>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>

                {featured ? (
                    <>
                        {/* Featured article */}
                        <a href={`/article/${featured.slug}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.2rem", marginBottom: "4.8rem", textDecoration: "none" }}>
                            <div style={{ aspectRatio: "16/10.8", overflow: "hidden", borderRadius: "0.8rem" }}>
                                <img src={getFeaturedImage(featured)} alt={decodeTitle(featured.title.rendered)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.2rem" }}>
                                <span style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    padding: "0.4rem 1rem", borderRadius: "0.2rem", backgroundColor: color,
                                    fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#fff",
                                    textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "flex-start",
                                }}>{label}</span>
                                <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "3.2rem", lineHeight: 1.15, color: "#1a1a1a" }}>
                                    {decodeTitle(featured.title.rendered)}
                                </h2>
                                <span style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>{formatDate(featured.date)}</span>
                            </div>
                        </a>

                        {/* Article grid */}
                        {rest.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.84rem" }}>
                                {rest.map((article) => (
                                    <a key={article.slug} href={`/article/${article.slug}`} style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
                                        <div style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: "0.8rem", marginBottom: "1.2rem" }}>
                                            <img src={getFeaturedImage(article)} alt={decodeTitle(article.title.rendered)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </div>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                                            padding: "0.3rem 0.8rem", borderRadius: "0.2rem", backgroundColor: color,
                                            fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#fff",
                                            textTransform: "uppercase", letterSpacing: "0.08em",
                                            alignSelf: "flex-start", marginBottom: "0.8rem",
                                        }}>{getPostCategory(article)}</span>
                                        <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25, color: "#1a1a1a" }}>
                                            {decodeTitle(article.title.rendered)}
                                        </h3>
                                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.6rem" }}>
                                            {formatDate(article.date)}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: "8rem 0" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>
                            No articles yet
                        </p>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>
                            Check back soon for {label} coverage.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
