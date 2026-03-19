import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MostRead from "@/components/MostRead";
import ArticleHero from "@/components/ArticleHero";
import {
    getPostBySlug, getPosts, getCategoryBySlug, getFeaturedImage, getPostCategory,
    getPostAuthor, formatDate, decodeTitle, stripHtml, WPPost
} from "@/lib/wordpress";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const badgeColors: Record<string, string> = {
    NFL: "#e9173d", NBA: "#e9173d", MLB: "#003087", NHL: "#003087",
    Soccer: "#1a1a1a", Boxing: "#1a1a1a", News: "#68676d",
    Transfer: "#e9173d", "Breaking News": "#e9173d", "La Liga": "#ff4b00",
    EPL: "#38003c", UCL: "#1a1f71", AFCON: "#009a44",
};

// ── generateMetadata ──────────────────────────────────────────────────────
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug).catch(() => null);
    if (!post) return { title: "Article Not Found" };

    const title = decodeTitle(post.title.rendered);
    const description = stripHtml(post.excerpt.rendered).slice(0, 160).trim();
    const image = getFeaturedImage(post);
    const category = getPostCategory(post);
    const author = getPostAuthor(post);
    const url = `${SITE_URL}/article/${slug}`;

    return {
        title,
        description,
        authors: [{ name: author }],
        keywords: [category, "football", "soccer", "sureodds", title.split(" ").slice(0, 5).join(" ")],
        alternates: { canonical: url },
        openGraph: {
            type: "article",
            url,
            title,
            description,
            images: [{ url: image, width: 1200, height: 630, alt: title }],
            publishedTime: post.date,
            authors: [author],
            section: category,
            tags: [category, "football", "soccer"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug).catch(() => null);
    if (!post) notFound();

    const category = getPostCategory(post);
    const author = getPostAuthor(post);
    const date = formatDate(post.date);
    const title = decodeTitle(post.title.rendered);
    const image = getFeaturedImage(post);
    const description = stripHtml(post.excerpt.rendered).slice(0, 160).trim();
    const color = badgeColors[category] ?? "#68676d";
    const url = `${SITE_URL}/article/${slug}`;

    // Fetch related posts from same category + most read
    const catSlug = category.toLowerCase().replace(/\s+/g, "-");
    let related: WPPost[] = [];
    let mostReadPosts: WPPost[] = [];
    try {
        const cat = await getCategoryBySlug(catSlug).catch(() => null);
        const [relatedPosts, mrPosts] = await Promise.all([
            cat ? getPosts({ categoryId: cat.id, perPage: 5 }) : getPosts({ perPage: 5 }),
            getPosts({ perPage: 4 }),
        ]);
        related = relatedPosts;
        mostReadPosts = mrPosts;
    } catch { /* ignore */ }

    const authorInitials = author.split(" ").map((n: string) => n[0]).join("").slice(0, 2);

    // JSON-LD: NewsArticle
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: title,
        description,
        image: [image],
        datePublished: post.date,
        dateModified: post.date,
        author: { "@type": "Person", name: author },
        publisher: {
            "@type": "Organization",
            name: "Sureodds",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleSection: category,
        keywords: `${category}, football, soccer, sureodds`,
        url,
    };

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ArticleHero
                image={image}
                title={title}
                category={category}
                categoryColor={color}
                author={author}
                authorInitials={authorInitials}
                date={date}
            />

            {/* Breadcrumb — also structured data */}
            <div style={{ borderBottom: "1px solid #e8ebed" }}>
                <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "1.2rem 1.2rem" }}>
                    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>
                        <a href="/" style={{ color: "#68676d" }}>Home</a>
                        <span aria-hidden="true">›</span>
                        <a href={`/category/${catSlug}`} style={{ color: "#68676d" }}>{category}</a>
                        <span aria-hidden="true">›</span>
                        <span style={{ color: "#1a1a1a", fontWeight: 600 }} className="clamp2">{title}</span>
                    </nav>
                </div>
            </div>

            {/* Body + Sidebar */}
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>
                <div className="article-body-grid">

                    {/* Article body */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "3.2rem", paddingBottom: "2.4rem", borderBottom: "1px solid #e8ebed" }}>
                            <div style={{
                                width: "4.4rem", height: "4.4rem", borderRadius: "50%",
                                backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{authorInitials}</span>
                            </div>
                            <div>
                                <p style={{ fontFamily: f, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>{author}</p>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>
                                    <time dateTime={post.date}>{date}</time>
                                </p>
                            </div>
                        </div>

                        <article
                            className="wp-content"
                            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                            style={{ fontFamily: f, fontSize: "1.8rem", lineHeight: 1.75, color: "#3d3c41" }}
                        />

                        {/* Tags */}
                        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "4rem", paddingTop: "2.4rem", borderTop: "1px solid #e8ebed" }}>
                            <a href={`/category/${catSlug}`} rel="tag" style={{
                                padding: "0.6rem 1.4rem", border: "1px solid #ddd", borderRadius: "2rem",
                                fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#3d3c41",
                            }}>{category}</a>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="article-sidebar" style={{ position: "sticky", top: "9rem" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.6rem", paddingBottom: "1rem", borderBottom: "2px solid #1a1a1a" }}>
                            More {category}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {related.filter(r => r.slug !== post.slug).slice(0, 4).map((r, i, arr) => (
                                <a key={r.slug} href={`/article/${r.slug}`} style={{
                                    display: "flex", gap: "1.2rem", textDecoration: "none",
                                    padding: "1.4rem 0",
                                    borderBottom: i < arr.length - 1 ? "1px solid #e8ebed" : "none",
                                }}>
                                    <div style={{ flexShrink: 0, width: "8.8rem", height: "5.8rem", overflow: "hidden", borderRadius: "0.4rem" }}>
                                        <img
                                            src={getFeaturedImage(r)}
                                            alt={decodeTitle(r.title.rendered)}
                                            loading="lazy"
                                            width={88} height={58}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                        <span style={{
                                            display: "inline-block", padding: "0.2rem 0.5rem", borderRadius: "0.2rem",
                                            backgroundColor: badgeColors[getPostCategory(r)] ?? "#68676d",
                                            fontFamily: f, fontSize: "0.9rem", fontWeight: 700, color: "#fff",
                                            alignSelf: "flex-start",
                                        }}>{getPostCategory(r)}</span>
                                        <p className="clamp2" style={{ fontFamily: f, fontSize: "1.35rem", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
                                            {decodeTitle(r.title.rendered)}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* AdSense placeholder — sidebar */}
                        <div style={{
                            marginTop: "3.2rem", padding: "2rem",
                            backgroundColor: "#f9fafb", border: "1px dashed #ddd",
                            borderRadius: "0.8rem", textAlign: "center",
                            minHeight: "25rem", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#c9c9c9", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Advertisement
                            </span>
                        </div>
                    </aside>

                </div>
            </div>

            <MostRead posts={mostReadPosts.map((p, i) => ({
                num: i + 1,
                title: decodeTitle(p.title.rendered),
                image: getFeaturedImage(p),
                slug: p.slug,
            }))} />
        </div>
    );
}
