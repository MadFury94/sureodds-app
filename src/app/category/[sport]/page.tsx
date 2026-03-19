import {
    getCategoryBySlug, getPosts, getFeaturedImage, getPostCategory,
    formatDate, decodeTitle, WPPost
} from "@/lib/wordpress";
import { getLeagueData, LEAGUE_IDS } from "@/lib/sportsdb";
import PageHeader from "@/components/PageHeader";
import HeroSection from "@/components/HeroSection";
import MostRead from "@/components/MostRead";
import LatestSection from "@/components/LatestSection";
import SportSection from "@/components/SportSection";
import { CategoryScoresTicker, FixturesRow, default as CategorySidebar } from "@/components/CategoryScores";

const fallbackImages: Record<string, string> = {
    epl: "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=1800&q=85",
    "la-liga": "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1800&q=85",
    ucl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1800&q=85",
    afcon: "https://images.unsplash.com/photo-1551958219-acbc595d9e47?w=1800&q=85",
    news: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=85",
    transfer: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1800&q=85",
    "breaking-news": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1800&q=85",
    "football-stories": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1800&q=85",
    "international-football": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1800&q=85",
    blog: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1800&q=85",
};

const categoryLabels: Record<string, string> = {
    news: "News", transfer: "Transfers", "breaking-news": "Breaking News",
    "football-stories": "Football Stories", "la-liga": "La Liga",
    epl: "English Premier League", ucl: "Champions League",
    afcon: "AFCON", "international-football": "International Football", blog: "Blog",
};

const badgeColors: Record<string, string> = {
    news: "#68676d", transfer: "#e9173d", "breaking-news": "#e9173d",
    "football-stories": "#1a1a1a", "la-liga": "#ff4b00", epl: "#38003c",
    ucl: "#1a1f71", afcon: "#009a44", "international-football": "#68676d", blog: "#68676d",
};

function toArticle(post: WPPost) {
    return {
        image: getFeaturedImage(post),
        category: getPostCategory(post),
        title: decodeTitle(post.title.rendered),
        slug: post.slug,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ sport: string }> }) {
    const { sport: rawSport } = await params;
    const sport = rawSport.toLowerCase();

    const label = categoryLabels[sport] ?? sport.replace(/-/g, " ").toUpperCase();
    const color = badgeColors[sport] ?? "#68676d";
    const leagueId = LEAGUE_IDS[sport];

    let posts: WPPost[] = [];
    let totalCount = 0;
    let headerImage = fallbackImages[sport] ?? fallbackImages.news;
    let headerLogo: string | undefined;

    try {
        const [cat, leagueData] = await Promise.all([
            getCategoryBySlug(sport),
            leagueId ? getLeagueData(leagueId) : Promise.resolve(null),
        ]);

        if (cat) {
            totalCount = cat.count;
            // Fetch up to 20 posts from this specific category
            posts = await getPosts({ categoryId: cat.id, perPage: 20 });
        }

        // TheSportsDB assets — fanart as background, badge as logo
        if (leagueData) {
            const fanart = leagueData.strFanart1 ?? leagueData.strFanart2 ?? leagueData.strBanner;
            if (fanart) headerImage = fanart;
            const badge = leagueData.strBadge ?? leagueData.strLogo;
            if (badge) headerLogo = badge;
        }
    } catch { /* fallback to defaults */ }

    const totalCountLabel = totalCount > 0 ? `${totalCount} articles` : undefined;

    // Section slices — all from category posts
    const heroPost = posts[0] ?? null;
    const leftPosts = posts.slice(1, 3);
    const topHeadlines = posts.slice(3, 9);
    const mostReadPosts = posts.slice(0, 4);
    const latestPosts = posts.slice(0, 8);
    const sportFeatured = posts[0] ?? null;
    const sportGridRaw = posts.slice(1, 5);
    const paddedGrid = [...sportGridRaw];
    while (paddedGrid.length < 4 && paddedGrid.length > 0) {
        paddedGrid.push(paddedGrid[paddedGrid.length - 1]);
    }

    const f = '"Proxima Nova", Arial, sans-serif';
    const fd = '"Druk Text Wide", "Arial Black", sans-serif';

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            {/* 1. Page header — TheSportsDB fanart bg + badge logo */}
            <PageHeader
                title={label}
                subtitle={totalCountLabel}
                image={headerImage}
                badge={label}
                badgeColor={color}
                logo={headerLogo}
                logoAlt={`${label} official badge`}
            />

            {/* 2. Scores ticker — right below header */}
            <CategoryScoresTicker sport={sport} color={color} />

            {posts.length === 0 ? (
                <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "8rem 1.2rem", textAlign: "center" }}>
                    <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>No articles yet</p>
                    <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Check back soon for {label} coverage.</p>
                </div>
            ) : (
                <>
                    {/* 3. Latest — category posts scrollable row */}
                    {latestPosts.length > 0 && (
                        <LatestSection posts={latestPosts.map(p => ({
                            slug: p.slug,
                            title: decodeTitle(p.title.rendered),
                            image: getFeaturedImage(p),
                            category: getPostCategory(p),
                            date: formatDate(p.date),
                        }))} />
                    )}

                    {/* 4. Hero — exact 3-col homepage layout, category posts */}
                    <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
                        <main style={{ maxWidth: "132.48rem", margin: "0 auto" }}>
                            <HeroSection
                                heroPost={heroPost ? toArticle(heroPost) : null}
                                leftPosts={leftPosts.map(toArticle)}
                                topHeadlines={topHeadlines.map(p => ({
                                    category: getPostCategory(p),
                                    title: decodeTitle(p.title.rendered),
                                    slug: p.slug,
                                }))}
                            />
                        </main>
                    </div>

                    {/* 5. Most Read — category posts */}
                    {mostReadPosts.length > 0 && (
                        <MostRead posts={mostReadPosts.map((p, i) => ({
                            num: i + 1,
                            title: decodeTitle(p.title.rendered),
                            image: getFeaturedImage(p),
                            slug: p.slug,
                        }))} />
                    )}

                    {/* 6. Two-column: main content + sticky sidebar */}
                    <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
                        <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "5rem 1.2rem" }} className="sport-section-wrap">
                            <div className="category-content-grid">

                                {/* Left: SportSection + Fixtures */}
                                <div style={{ minWidth: 0 }}>
                                    {sportFeatured && paddedGrid.length >= 2 && (
                                        <SportSection
                                            title={label}
                                            featured={toArticle(sportFeatured)}
                                            grid={paddedGrid.slice(0, 4).map(toArticle) as [ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>]}
                                            viewAllHref={`/category/${sport}`}
                                        />
                                    )}
                                    <FixturesRow sport={sport} color={color} label={label} />
                                </div>

                                {/* Right: sticky sidebar */}
                                <CategorySidebar sport={sport} color={color} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
