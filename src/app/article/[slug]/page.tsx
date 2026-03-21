import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MostRead from "@/components/MostRead";
import ArticleHero from "@/components/ArticleHero";
import AdUnit from "@/components/AdUnit";
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
    NFL: "#ff6b00", NBA: "#ff6b00", MLB: "#003087", NHL: "#003087",
    Soccer: "#1a1a1a", Boxing: "#1a1a1a", News: "#68676d",
    Transfer: "#ff6b00", "Breaking News": "#ff6b00", "La Liga": "#ff4b00",
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

                        {/* In-article ad — below content */}
                        <AdUnit slot="0000000000" format="auto" style={{ margin: "3.2rem 0" }} />

                        {/* Tags + Share */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.2rem", marginTop: "4rem", paddingTop: "2.4rem", borderTop: "1px solid #e8ebed" }}>
                            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                                <a href={`/category/${catSlug}`} rel="tag" style={{
                                    padding: "0.6rem 1.4rem", border: "1px solid #ddd", borderRadius: "2rem",
                                    fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#3d3c41",
                                    textDecoration: "none",
                                }}>{category}</a>
                            </div>
                            {/* Share buttons */}
                            <div style={{ display: "flex", gap: "0.8rem" }}>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.4rem", backgroundColor: "#25D366", borderRadius: "2rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", textDecoration: "none" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                                    WhatsApp
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.4rem", backgroundColor: "#000", borderRadius: "2rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", textDecoration: "none" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.26 5.632 4.746-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    Share
                                </a>
                            </div>
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

                        {/* AdSense — sidebar */}
                        <AdUnit slot="0000000000" format="vertical" style={{ marginTop: "3.2rem" }} />
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
