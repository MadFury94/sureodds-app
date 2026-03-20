import type { Metadata } from "next";
import ScoresTicker from "@/components/ScoresTicker";
import MostRead from "@/components/MostRead";
import SportSection from "@/components/SportSection";
import HeroSection from "@/components/HeroSection";
import LatestSection from "@/components/LatestSection";
import PhoneMarquee from "@/components/PhoneMarquee";
import {
  getPosts, getCategories, getFeaturedImage, getPostCategory,
  formatDate, decodeTitle, WPPost, WPCategory
} from "@/lib/wordpress";
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

  const [transferPosts, breakingPosts, laLigaPosts, eplPosts, latestNewsPosts] = await Promise.all([
    getPostsBySlug("transfer", cats, 5),
    getPostsBySlug("breaking-news", cats, 5),
    getPostsBySlug("la-liga", cats, 5),
    getPostsBySlug("epl", cats, 5),
    getPostsBySlug("news", cats, 8),
  ]);

  const heroPost = latestPosts[0] ?? null;
  const leftPosts = latestPosts.slice(1, 3);
  const topHeadlines = latestPosts.slice(3, 9);
  const mostReadPosts = latestPosts.slice(0, 4);

  function toSection(title: string, posts: WPPost[], catSlug: string) {
    if (posts.length < 2) return null;
    const featured = toArticle(posts[0]);
    const grid = posts.slice(1, 5).map(toArticle);
    while (grid.length < 4) grid.push(grid[grid.length - 1] ?? featured);
    return {
      title,
      featured,
      grid: grid.slice(0, 4) as [ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>, ReturnType<typeof toArticle>],
      viewAllHref: `/category/${catSlug}`,
    };
  }

  const transferSection = toSection("Transfers", transferPosts, "transfer");
  const breakingSection = toSection("Breaking News", breakingPosts, "breaking-news");
  const laLigaSection = toSection("La Liga", laLigaPosts, "la-liga");
  const eplSection = toSection("EPL", eplPosts, "epl");

  return (
    <>
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

      {transferSection && <SportSection {...transferSection} />}

      {latestNewsPosts.length > 0 && (
        <LatestSection posts={latestNewsPosts.map(p => ({
          slug: p.slug,
          title: decodeTitle(p.title.rendered),
          image: getFeaturedImage(p),
          category: getPostCategory(p),
          date: formatDate(p.date),
        }))} />
      )}

      <PhoneMarquee />

      {breakingSection && <SportSection {...breakingSection} reverse />}
      {laLigaSection && <SportSection {...laLigaSection} />}
      {eplSection && <SportSection {...eplSection} reverse />}
    </>
  );
}
