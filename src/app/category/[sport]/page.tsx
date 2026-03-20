import type { Metadata } from "next";
import {
    getCategoryBySlug, getPosts, getFeaturedImage, getPostCategory,
    formatDate, decodeTitle, WPPost
} from "@/lib/wordpress";
import { getLeaguePageData, FD_LEAGUE_CODES, type MatchCard, type StandingRow } from "@/lib/footballdata";
import {
    SITE_URL, CATEGORY_IMAGES, CATEGORY_LABELS, CATEGORY_COLORS,
    LEAGUE_LOGOS, fonts, colors, MAX_WIDTH, TWITTER_FEEDS,
} from "@/lib/config";
import PageHeader from "@/components/PageHeader";
import HeroSection from "@/components/HeroSection";
import MostRead from "@/components/MostRead";
import LatestSection from "@/components/LatestSection";
import SportSection from "@/components/SportSection";
import TwitterFeed from "@/components/TwitterFeed";
import { CategoryScoresTicker, FixturesRow, default as CategorySidebar } from "@/components/CategoryScores";

const categoryDescriptions: Record<string, string> = {
    news: "Latest football news, match reports, and analysis from around the world.",
    transfer: "Transfer news, rumours, confirmed signings and player movements across top leagues.",
    "breaking-news": "Breaking football news as it happens — transfers, injuries, managerial changes and more.",
    "football-stories": "In-depth football stories, features and long reads from the beautiful game.",
    "la-liga": "La Liga news, match previews, results and standings. Real Madrid, Barcelona and more.",
    epl: "English Premier League news, fixtures, results, standings and expert analysis.",
    ucl: "UEFA Champions League news, results, group standings and knockout stage coverage.",
    afcon: "Africa Cup of Nations news, results, fixtures and team updates.",
    "international-football": "International football news, World Cup qualifiers, friendlies and national team updates.",
    blog: "Football opinion, analysis and fan perspectives from the Sureodds team.",
};

const categoryKeywords: Record<string, string[]> = {
    news: ["football news", "soccer news", "latest football", "match reports"],
    transfer: ["transfer news", "football transfers", "player signings", "transfer rumours"],
    "breaking-news": ["breaking football news", "football breaking news", "latest sports news"],
    "football-stories": ["football stories", "football features", "football analysis"],
    "la-liga": ["La Liga news", "Real Madrid", "Barcelona", "Spanish football"],
    epl: ["Premier League news", "EPL", "English football", "Arsenal", "Liverpool", "Man City"],
    ucl: ["Champions League", "UCL", "European football", "UEFA"],
    afcon: ["AFCON", "Africa Cup of Nations", "African football"],
    "international-football": ["international football", "World Cup", "national teams"],
    blog: ["football blog", "football opinion", "football analysis"],
};

function toArticle(post: WPPost) {
    return {
        image: getFeaturedImage(post),
        category: getPostCategory(post),
        title: decodeTitle(post.title.rendered),
        slug: post.slug,
    };
}

// ── generateMetadata ──────────────────────────────────────────────────────
export async function generateMetadata(
    { params }: { params: Promise<{ sport: string }> }
): Promise<Metadata> {
    const { sport: rawSport } = await params;
    const sport = rawSport.toLowerCase();
    const label = CATEGORY_LABELS[sport] ?? sport.replace(/-/g, " ").toUpperCase();
    const description = categoryDescriptions[sport] ?? `Latest ${label} news, analysis and updates on Sureodds.`;
    const keywords = categoryKeywords[sport] ?? [label, "football", "sureodds"];
    const url = `${SITE_URL}/category/${sport}`;
    const ogImage = CATEGORY_IMAGES[sport] ?? CATEGORY_IMAGES.news;

    return {
        title: `${label} — Latest News & Analysis`,
        description,
        keywords: [...keywords, "sureodds"],
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            url,
            title: `${label} | Sureodds`,
            description,
            images: [{ url: ogImage, width: 1200, height: 630, alt: label }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${label} | Sureodds`,
            description,
            images: [ogImage],
        },
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ sport: string }> }) {
    const { sport: rawSport } = await params;
    const sport = rawSport.toLowerCase();

    const label = CATEGORY_LABELS[sport] ?? sport.replace(/-/g, " ").toUpperCase();
    const color = CATEGORY_COLORS[sport] ?? colors.gray500;
    const description = categoryDescriptions[sport] ?? `Latest ${label} news and analysis.`;
    const url = `${SITE_URL}/category/${sport}`;

    let posts: WPPost[] = [];
    let totalCount = 0;
    let recent: MatchCard[] = [];
    let upcoming: MatchCard[] = [];
    let standings: StandingRow[] = [];

    const headerImage = CATEGORY_IMAGES[sport] ?? CATEGORY_IMAGES.news;
    const headerLogo = LEAGUE_LOGOS[sport];
    const fdCode = FD_LEAGUE_CODES[sport];

    try {
        const [cat, fdData] = await Promise.all([
            getCategoryBySlug(sport),
            fdCode ? getLeaguePageData(fdCode) : Promise.resolve({ recent: [], upcoming: [], standings: [] }),
        ]);

        if (cat) {
            totalCount = cat.count;
            posts = await getPosts({ categoryId: cat.id, perPage: 20 });
        }

        recent = fdData.recent;
        upcoming = fdData.upcoming;
        standings = fdData.standings;
    } catch { /* fallback to defaults */ }

    const totalCountLabel = totalCount > 0 ? `${totalCount} articles` : undefined;

    // Section slices — all from category posts
    const heroPost = posts[0] ?? null;
    const leftPosts = posts.slice(1, 3);
    // Top headlines: posts 3–8 from THIS category, fall back to any available posts
    const topHeadlines = posts.length > 3
        ? posts.slice(3, 9)
        : posts.slice(0, 6);  // if few posts, reuse from top
    const mostReadPosts = posts.slice(0, 4);
    const latestPosts = posts.slice(0, 8);
    const sportFeatured = posts[0] ?? null;
    const sportGridRaw = posts.slice(1, 5);
    const paddedGrid = [...sportGridRaw];
    while (paddedGrid.length < 4 && paddedGrid.length > 0) {
        paddedGrid.push(paddedGrid[paddedGrid.length - 1]);
    }

    const f = fonts.body;
    const fd = fonts.display;

    // JSON-LD: CollectionPage
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${label} | Sureodds`,
        description,
        url,
        publisher: {
            "@type": "Organization",
            name: "Sureodds",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
        },
        ...(posts.length > 0 && {
            mainEntity: {
                "@type": "ItemList",
                itemListElement: posts.slice(0, 10).map((p, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    url: `${SITE_URL}/article/${p.slug}`,
                    name: decodeTitle(p.title.rendered),
                })),
            },
        }),
    };

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 1. Page header */}
            <PageHeader
                title={label}
                subtitle={totalCountLabel}
                image={headerImage}
                badge={label}
                badgeColor={color}
                logo={headerLogo}
                logoAlt={`${label} official badge`}
            />

            {/* 2. Scores ticker */}
            <CategoryScoresTicker recent={recent} upcoming={upcoming} color={color} />

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

                    {/* 4. Twitter feed — category-specific list or fallback to default */}
                    <TwitterFeed
                        listUrl={TWITTER_FEEDS[sport] ?? TWITTER_FEEDS.default}
                        title="Latest on X"
                    />

                    {/* 5. Hero — 3-col layout, top headlines from THIS category */}
                    <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
                        <main style={{ maxWidth: "132.48rem", margin: "0 auto" }}>
                            <HeroSection
                                heroPost={heroPost ? toArticle(heroPost) : null}
                                leftPosts={leftPosts.map(toArticle)}
                                topHeadlines={topHeadlines.map(p => ({
                                    category: getPostCategory(p),
                                    title: decodeTitle(p.title.rendered),
                                    slug: p.slug,
                                    logo: LEAGUE_LOGOS[getPostCategory(p).toLowerCase().replace(/\s+/g, "-")] ?? LEAGUE_LOGOS[sport],
                                }))}
                            />
                        </main>
                    </div>

                    {/* 5. Most Read */}
                    {mostReadPosts.length > 0 && (
                        <MostRead posts={mostReadPosts.map((p, i) => ({
                            num: i + 1,
                            title: decodeTitle(p.title.rendered),
                            image: getFeaturedImage(p),
                            slug: p.slug,
                        }))} />
                    )}

                    {/* 6. Two-column: SportSection + Fixtures | Sidebar */}
                    <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
                        <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "5rem 1.2rem" }} className="sport-section-wrap">
                            <div className="category-content-grid">

                                <div style={{ minWidth: 0 }}>
                                    {sportFeatured && paddedGrid.length >= 2 && (
                                        <SportSection
                                            title={label}
                                            featured={toArticle(sportFeatured)}
                                            grid={paddedGrid.slice(0, 4).map(toArticle) as [ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>]}
                                            viewAllHref={`/category/${sport}`}
                                        />
                                    )}
                                    <FixturesRow fixtures={upcoming} color={color} label={label} />
                                </div>

                                {/* Sidebar: standings or other leagues + AdSense slot */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
                                    <CategorySidebar sport={sport} color={color} standings={standings} recent={recent} />

                                    {/* AdSense placeholder */}
                                    <div style={{
                                        padding: "2rem",
                                        backgroundColor: "#f9fafb",
                                        border: "1px dashed #ddd",
                                        borderRadius: "0.8rem",
                                        textAlign: "center",
                                        minHeight: "25rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#c9c9c9", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                            Advertisement
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
