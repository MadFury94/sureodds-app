import type { Metadata } from "next";
import ScoresTicker from "@/components/ScoresTicker";
import LiveMatchesTicker from "@/components/LiveMatchesTicker";
import MostRead from "@/components/MostRead";
import SportSection from "@/components/SportSection";
import HeroSection from "@/components/HeroSection";
import LatestSection from "@/components/LatestSection";
import PhoneMarquee from "@/components/PhoneMarquee";
import AdUnit from "@/components/AdUnit";
import ScoreSection from "@/components/ScoreSection";
import {
  getPosts, getCategories, getFeaturedImage, getPostCategory,
  formatDate, decodeTitle, WPPost, WPCategory
} from "@/lib/wordpress";
import { getRecentMatches, getUpcomingMatches, getWorldCupMatches } from "@/lib/footballdata";
import { SITE_URL, LEAGUE_LOGOS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sureodds | Football News, Betting Tips & Match Analysis",
  description: "Your home for football news, transfer updates, match previews, betting tips and live scores. EPL, La Liga, UCL, AFCON and more.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Sureodds | Football News, Betting Tips & Match Analysis",
    description: "Your home for football news, transfer updates, match previews, betting tips and live scores.",
    images: [{ url: `${SITE_URL}/logo.png`, width: 800, height: 800, alt: "Sureodds" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sureodds | Football News, Betting Tips & Match Analysis",
    description: "Your home for football news, transfer updates, match previews, betting tips and live scores.",
    images: [`${SITE_URL}/logo.png`],
  },
};

function toArticle(post: WPPost) {
  return {
    image: getFeaturedImage(post),
    category: getPostCategory(post),
    title: decodeTitle(post.title.rendered),
    slug: post.slug,
  };
}

async function getPostsBySlug(catSlug: string, cats: WPCategory[], perPage = 5): Promise<WPPost[]> {
  const cat = cats.find(c => c.slug === catSlug);
  if (!cat) return [];
  try {
    return await getPosts({ categoryId: cat.id, perPage });
  } catch { return []; }
}

export default async function Home() {
  let cats: WPCategory[] = [];
  let latestPosts: WPPost[] = [];

  try {
    [cats, latestPosts] = await Promise.all([
      getCategories(),
      getPosts({ perPage: 20 }),
    ]);
  } catch { /* fallback to empty */ }

  const [transferPosts, breakingPosts, laLigaPosts, eplPosts, serieAPosts, latestNewsPosts, featuredMatches] = await Promise.all([
    getPostsBySlug("transfer", cats, 5),
    getPostsBySlug("breaking-news", cats, 5),
    getPostsBySlug("la-liga", cats, 5),
    getPostsBySlug("epl", cats, 5),
    getPostsBySlug("serie-a", cats, 5),
    getPostsBySlug("news", cats, 8),
    getFeaturedMatches(),
  ]);

  // ── Deduplication ──────────────────────────────────────────────────────
  // Track slugs already shown to avoid the same story appearing in multiple sections
  const shown = new Set<string>();
  function dedupe(posts: WPPost[], limit: number): WPPost[] {
    const out: WPPost[] = [];
    for (const p of posts) {
      if (!shown.has(p.slug) && out.length < limit) {
        shown.add(p.slug);
        out.push(p);
      }
    }
    return out;
  }

  // Hero gets first pick
  const heroPost = latestPosts[0] ?? null;
  if (heroPost) shown.add(heroPost.slug);
  const leftPosts = dedupe(latestPosts.slice(1), 2);
  const topHeadlines = dedupe(latestPosts, 6);

  // Most Read pulls from a separate "popular" pool — allow overlap here intentionally
  // (readers expect Most Read to be independent of what's above the fold)
  const mostReadPosts = latestPosts.slice(0, 4);

  // Latest news strip — exclude anything already in hero/left/headlines
  const latestStrip = dedupe(
    [...latestNewsPosts, ...latestPosts],
    8
  );

  // Fetch featured matches for ScoreSection
  async function getFeaturedMatches() {
    try {
      const [wcMatches, eplMatches, laLigaMatches, uclMatches] = await Promise.all([
        getWorldCupMatches(4),
        getRecentMatches("PL", 2),
        getRecentMatches("PD", 2),
        getRecentMatches("CL", 2),
      ]);

      // World Cup matches first if available, then league matches
      const allMatches = wcMatches.length > 0
        ? [...wcMatches, ...eplMatches, ...laLigaMatches, ...uclMatches]
        : [...eplMatches, ...laLigaMatches, ...uclMatches];

      return allMatches.slice(0, 4).map(match => ({
        title: `${match.home} vs ${match.away}`,
        emoji: "⚽",
        image: match.homeCrest || "/afconbg.webp",
        homeTeam: match.home,
        awayTeam: match.away,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
      }));
    } catch {
      return [];
    }
  }

  function toSection(title: string, posts: WPPost[], catSlug: string) {
    if (posts.length < 2) return null;
    const featured = toArticle(posts[0]);
    const grid = posts.slice(1, 5).map(toArticle);
    while (grid.length < 4) grid.push(grid[grid.length - 1] ?? featured);
    return {
      title,
      slug: catSlug,
      featured,
      grid: grid.slice(0, 4) as [ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>],
      viewAllHref: `/category/${catSlug}`,
    };
  }

  const transferSection = toSection("Transfers", dedupe(transferPosts, 5), "transfer");
  const breakingSection = toSection("Breaking News", dedupe(breakingPosts, 5), "breaking-news");
  const laLigaSection = toSection("La Liga", dedupe(laLigaPosts, 5), "la-liga");
  const eplSection = toSection("Premier League", dedupe(eplPosts, 5), "epl");
  const serieASection = toSection("Serie A", dedupe(serieAPosts, 5), "serie-a");

  return (
    <>
      <LiveMatchesTicker />
      <ScoresTicker />

      <div style={{ background: "linear-gradient(to bottom, #e8ebed 0%, #ffffff 100%)" }}>
        <main style={{ maxWidth: "132.48rem", margin: "0 auto" }}>
          <HeroSection
            heroPost={heroPost ? toArticle(heroPost) : null}
            leftPosts={leftPosts.map(toArticle)}
            topHeadlines={topHeadlines.map(p => ({
              category: getPostCategory(p),
              title: decodeTitle(p.title.rendered),
              slug: p.slug,
              logo: LEAGUE_LOGOS[getPostCategory(p).toLowerCase().replace(/\s+/g, "-")],
            }))}
          />
        </main>
      </div>

      <MostRead posts={mostReadPosts.map((p, i) => ({
        num: i + 1,
        title: decodeTitle(p.title.rendered),
        image: getFeaturedImage(p),
        slug: p.slug,
      }))} />

      {featuredMatches.length > 0 && (
        <ScoreSection
          title="Latest Scores"
          cards={featuredMatches}
        />
      )}

      {transferSection && <SportSection {...transferSection} />}

      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? "0000000000"} format="auto" style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }} />

      {latestStrip.length > 0 && (
        <LatestSection posts={latestStrip.map(p => ({
          slug: p.slug,
          title: decodeTitle(p.title.rendered),
          image: getFeaturedImage(p),
          category: getPostCategory(p),
          date: formatDate(p.date),
        }))} />
      )}

      <PhoneMarquee />

      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? "0000000000"} format="auto" style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }} />

      {breakingSection && <SportSection {...breakingSection} reverse />}
      {laLigaSection && <SportSection {...laLigaSection} />}
      {eplSection && <SportSection {...eplSection} reverse />}
      {serieASection && <SportSection {...serieASection} />}
    </>
  );
}
