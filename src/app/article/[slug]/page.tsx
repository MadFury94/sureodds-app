import { notFound } from "next/navigation";
import MostRead from "@/components/MostRead";
import ArticleHero from "@/components/ArticleHero";
import {
    getPostBySlug, getPosts, getFeaturedImage, getPostCategory,
    getPostAuthor, formatDate, decodeTitle, WPPost
} from "@/lib/wordpress";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const badgeColors: Record<string, string> = {
    NFL: "#e9173d", NBA: "#e9173d", MLB: "#003087", NHL: "#003087",
    Soccer: "#1a1a1a", Boxing: "#1a1a1a", News: "#68676d",
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug).catch(() => null);
    if (!post) notFound();

    const category = getPostCategory(post);
    const author = getPostAuthor(post);
    const date = formatDate(post.date);
    const title = decodeTitle(post.title.rendered);
    const image = getFeaturedImage(post);
    const color = badgeColors[category] ?? "#68676d";

    let related: WPPost[] = [];
    try { related = await getPosts({ perPage: 4 }); } catch { /* ignore */ }

    let mostReadPosts: WPPost[] = [];
    try { mostReadPosts = await getPosts({ perPage: 4 }); } catch { /* ignore */ }

    const authorInitials = author.split(" ").map((n: string) => n[0]).join("").slice(0, 2);

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            {/* Full-viewport hero with image + overlay + title */}
            <ArticleHero
                image={image}
                title={title}
                category={category}
                categoryColor={color}
                author={author}
                authorInitials={authorInitials}
                date={date}
            />

            {/* Breadcrumb */}
            <div style={{ borderBottom: "1px solid #e8ebed" }}>
                <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "1.2rem 1.2rem" }}>
                    <nav style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>
                        <a href="/" style={{ color: "#68676d" }}>Home</a>
                        <span>›</span>
                        <a href={`/category/${category.toLowerCase()}`} style={{ color: "#68676d" }}>{category}</a>
                        <span>›</span>
                        <span style={{ color: "#1a1a1a", fontWeight: 600 }} className="clamp2">{title}</span>
                    </nav>
                </div>
            </div>

            {/* Body + Sidebar — BR layout */}
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>
                <div className="article-body-grid">

                    {/* Article body */}
                    <div>
                        {/* Author row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "3.2rem", paddingBottom: "2.4rem", borderBottom: "1px solid #e8ebed" }}>
                            <div style={{
                                width: "4.4rem", height: "4.4rem", borderRadius: "50%",
                                backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{authorInitials}</span>
                            </div>
                            <div>
                                <p style={{ fontFamily: f, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>{author}</p>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>{date}</p>
                            </div>
                        </div>

                        <article
                            className="wp-content"
                            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                            style={{ fontFamily: f, fontSize: "1.8rem", lineHeight: 1.75, color: "#3d3c41" }}
                        />

                        {/* Tags */}
                        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "4rem", paddingTop: "2.4rem", borderTop: "1px solid #e8ebed" }}>
                            <a href={`/category/${category.toLowerCase()}`} style={{
                                padding: "0.6rem 1.4rem", border: "1px solid #ddd", borderRadius: "2rem",
                                fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#3d3c41",
                            }}>{category}</a>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="article-sidebar" style={{ position: "sticky", top: "9rem" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.6rem", paddingBottom: "1rem", borderBottom: "2px solid #1a1a1a" }}>
                            Top News
                        </p>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {related.filter(r => r.slug !== post.slug).slice(0, 4).map((r, i, arr) => (
                                <a key={r.slug} href={`/article/${r.slug}`} style={{
                                    display: "flex", gap: "1.2rem", textDecoration: "none",
                                    padding: "1.4rem 0",
                                    borderBottom: i < arr.length - 1 ? "1px solid #e8ebed" : "none",
                                }}>
                                    <div style={{ flexShrink: 0, width: "8.8rem", height: "5.8rem", overflow: "hidden", borderRadius: "0.4rem" }}>
                                        <img src={getFeaturedImage(r)} alt={decodeTitle(r.title.rendered)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
