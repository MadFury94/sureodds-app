"use client";
import { useState, useEffect, useRef, use } from "react";
import { fonts } from "@/lib/config";
import { sanitizeHtml } from "@/lib/sanitize";

const f = fonts.body;
const fd = fonts.display;

const WP_API = process.env.NEXT_PUBLIC_WP_API;
const STATUS_OPTIONS = ["draft", "publish", "pending", "private"];

interface WPCategory { id: number; name: string; slug: string; }

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [status, setStatus] = useState("draft");
    const [categories, setCategories] = useState<WPCategory[]>([]);
    const [selectedCats, setSelectedCats] = useState<number[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [featuredImage, setFeaturedImage] = useState("");
    const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaItems, setMediaItems] = useState<{ id: number; source_url: string; title: { rendered: string } }[]>([]);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [uploadingFeatured, setUploadingFeatured] = useState(false);
    const featuredFileRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState<"idle" | "saving" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [postLink, setPostLink] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        async function init() {
            // Auth check
            const authRes = await fetch("/api/wordpress-auth");
            const authData = await authRes.json();
            if (!authData.valid) { window.location.href = "/admin-login"; return; }

            // Load categories
            fetch(`${WP_API}/categories?per_page=100`)
                .then(r => r.json())
                .then(setCategories)
                .catch(() => { });

            // Load post
            try {
                const tokenRes = await fetch("/api/admin-token");
                const { token } = await tokenRes.json();
                const res = await fetch(`${WP_API}/posts/${id}?context=edit&_embed=1`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("Post not found");
                const post = await res.json();

                setTitle(post.title?.raw ?? post.title?.rendered ?? "");
                setContent(post.content?.raw ?? post.content?.rendered ?? "");
                setExcerpt(post.excerpt?.raw ?? post.excerpt?.rendered ?? "");
                setStatus(post.status ?? "draft");
                setSelectedCats(post.categories ?? []);
                setPostLink(post.link ?? "");

                // Featured image
                const media = post._embedded?.["wp:featuredmedia"]?.[0];
                if (media?.source_url) {
                    setFeaturedImage(media.source_url);
                    setFeaturedImageId(media.id ?? null);
                }

                // Tags
                const tagTerms = post._embedded?.["wp:term"]?.find(
                    (group: Array<{ taxonomy: string; name: string }>) => group[0]?.taxonomy === "post_tag"
                );
                if (tagTerms) setTags(tagTerms.map((t: { name: string }) => t.name));
            } catch (err) {
                setErrorMsg(err instanceof Error ? err.message : "Failed to load post.");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [id]);

    function addTag(e: React.KeyboardEvent) {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const t = tagInput.trim().replace(/,$/, "");
            if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
            setTagInput("");
        }
    }

    function removeTag(t: string) { setTags(prev => prev.filter(x => x !== t)); }

    async function openMediaPicker() {
        setShowMediaPicker(true);
        if (mediaItems.length > 0) return;
        setMediaLoading(true);
        try {
            const tokenRes = await fetch("/api/admin-token");
            const { token: t } = await tokenRes.json();
            const res = await fetch(`${WP_API}/media?per_page=24&orderby=date&order=desc&media_type=image`, {
                headers: { Authorization: `Bearer ${t}` },
            });
            const data = await res.json();
            setMediaItems(Array.isArray(data) ? data : []);
        } catch { /* ignore */ } finally {
            setMediaLoading(false);
        }
    }

    async function handleFeaturedUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFeatured(true);
        setErrorMsg("");
        try {
            const tokenRes = await fetch("/api/admin-token");
            const { token: t } = await tokenRes.json();
            if (!t) throw new Error("Not authenticated");
            const res = await fetch(`${WP_API}/media`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${t}`,
                    "Content-Disposition": `attachment; filename="${file.name}"`,
                    "Content-Type": file.type,
                },
                body: file,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error((err as { message?: string }).message ?? `Upload failed (${res.status})`);
            }
            const uploaded = await res.json();
            setFeaturedImage(uploaded.source_url);
            setFeaturedImageId(uploaded.id);
            setMediaItems(prev => [uploaded, ...prev]);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Image upload failed.");
        } finally {
            setUploadingFeatured(false);
            if (featuredFileRef.current) featuredFileRef.current.value = "";
        }
    }

    function toggleCat(id: number) {
        setSelectedCats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setContent(e.target.value);
        const el = textareaRef.current;
        if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
    }

    async function handleSave(publishNow = false) {
        if (!title.trim()) { setErrorMsg("Title is required."); return; }
        setSaving(true);
        setSaved("saving");
        setErrorMsg("");

        try {
            const tokenRes = await fetch("/api/admin-token");
            const { token } = await tokenRes.json();

            // Resolve tag IDs
            const tagIds: number[] = [];
            for (const tag of tags) {
                try {
                    const existing = await fetch(`${WP_API}/tags?search=${encodeURIComponent(tag)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(r => r.json());
                    if (existing.length > 0) {
                        tagIds.push(existing[0].id);
                    } else {
                        const created = await fetch(`${WP_API}/tags`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ name: tag }),
                        }).then(r => r.json());
                        if (created.id) tagIds.push(created.id);
                    }
                } catch { /* skip */ }
            }

            const body: Record<string, unknown> = {
                title,
                content,
                excerpt,
                status: publishNow ? "publish" : status,
                categories: selectedCats,
                tags: tagIds,
            };

            // Set featured image
            if (featuredImageId) {
                body.featured_media = featuredImageId;
            } else if (featuredImage === "") {
                body.featured_media = 0; // Remove featured image
            }

            const res = await fetch(`${WP_API}/posts/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message ?? "Failed to update post.");
            }

            const updated = await res.json();
            if (publishNow) setStatus("publish");
            setPostLink(updated.link ?? postLink);
            setSaved("success");
            setTimeout(() => setSaved("idle"), 3000);
        } catch (err: unknown) {
            setSaved("error");
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "1rem 1.2rem",
        border: "1.5px solid #e8ebed", borderRadius: "0.6rem",
        fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a",
        backgroundColor: "#fff", outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s",
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: f, fontSize: "1.2rem", fontWeight: 700,
        color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em",
        display: "block", marginBottom: "0.6rem",
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40rem" }}>
                <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Loading post…</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.4rem", flexWrap: "wrap", gap: "1.2rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "0.4rem" }}>
                        <a href="/admin-dashboard/posts" style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textDecoration: "none" }}>← All Posts</a>
                    </div>
                    <h1 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        Edit Post
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: "0.4rem 0 0" }}>
                        ID: {id} {postLink && <a href={postLink} target="_blank" style={{ color: "#ff6b00", marginLeft: "0.8rem" }}>View live ↗</a>}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => handleSave(false)} disabled={saving} style={{
                        padding: "1rem 2rem", border: "1.5px solid #e8ebed",
                        borderRadius: "0.6rem", backgroundColor: "#fff",
                        fontFamily: f, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a",
                        cursor: saving ? "not-allowed" : "pointer",
                    }}>
                        Save Draft
                    </button>
                    <button onClick={() => handleSave(true)} disabled={saving} style={{
                        padding: "1rem 2.4rem", border: "none",
                        borderRadius: "0.6rem", backgroundColor: saving ? "#68676d" : "#ff6b00",
                        fontFamily: f, fontWeight: 700, fontSize: "1.3rem", color: "#fff",
                        cursor: saving ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: "0.6rem",
                    }}>
                        {saving ? "Saving…" : status === "publish" ? "Update →" : "Publish →"}
                    </button>
                </div>
            </div>

            {/* Status messages */}
            {saved === "success" && (
                <div style={{ padding: "1.2rem 1.6rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.6rem", marginBottom: "1.6rem", fontFamily: f, fontSize: "1.4rem", color: "#16a34a", fontWeight: 600 }}>
                    ✓ Post updated successfully!
                </div>
            )}
            {(saved === "error" || errorMsg) && (
                <div style={{ padding: "1.2rem 1.6rem", backgroundColor: "#fff7f0", border: "1px solid #fed7aa", borderRadius: "0.6rem", marginBottom: "1.6rem", fontFamily: f, fontSize: "1.4rem", color: "#ff6b00", fontWeight: 600 }}>
                    ✗ {errorMsg || "Something went wrong."}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 30rem", gap: "2rem", alignItems: "start" }}>

                {/* ── Main editor ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>

                    {/* Title */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", padding: "2rem" }}>
                        <input
                            type="text"
                            placeholder="Post title…"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{
                                ...inputStyle,
                                fontSize: "2.4rem", fontFamily: fd, fontWeight: 700,
                                border: "none", padding: "0", borderRadius: 0,
                                borderBottom: "2px solid #f0f0f0", paddingBottom: "1.2rem",
                            }}
                            onFocus={e => (e.target.style.borderBottomColor = "#ff6b00")}
                            onBlur={e => (e.target.style.borderBottomColor = "#f0f0f0")}
                        />
                    </div>

                    {/* Write / Preview tabs */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
                            {(["write", "preview"] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                    padding: "1.2rem 2rem", border: "none", cursor: "pointer",
                                    fontFamily: f, fontWeight: 700, fontSize: "1.3rem",
                                    textTransform: "capitalize",
                                    backgroundColor: activeTab === tab ? "#fff" : "#f9f9f9",
                                    color: activeTab === tab ? "#ff6b00" : "#68676d",
                                    borderBottom: activeTab === tab ? "2px solid #ff6b00" : "2px solid transparent",
                                    transition: "all 0.15s",
                                }}>{tab}</button>
                            ))}
                            {activeTab === "write" && (
                                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", padding: "0 1.2rem" }}>
                                    {[
                                        { label: "B", action: () => setContent(c => c + "**bold**"), title: "Bold" },
                                        { label: "I", action: () => setContent(c => c + "*italic*"), title: "Italic" },
                                        { label: "H2", action: () => setContent(c => c + "\n## Heading\n"), title: "Heading" },
                                        { label: "🔗", action: () => setContent(c => c + "[link text](url)"), title: "Link" },
                                    ].map(btn => (
                                        <button key={btn.label} onClick={btn.action} title={btn.title} style={{
                                            padding: "0.4rem 0.8rem", border: "1px solid #e8ebed",
                                            borderRadius: "0.4rem", backgroundColor: "#fff",
                                            fontFamily: f, fontWeight: 700, fontSize: "1.2rem",
                                            color: "#1a1a1a", cursor: "pointer",
                                        }}>{btn.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {activeTab === "write" ? (
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={handleContentChange}
                                placeholder="Post content…"
                                style={{
                                    ...inputStyle, border: "none", borderRadius: 0,
                                    minHeight: "40rem", resize: "none", lineHeight: 1.8,
                                    padding: "2rem",
                                }}
                            />
                        ) : (
                            <div
                                className="wp-content"
                                style={{ padding: "2rem", minHeight: "40rem", fontFamily: f, fontSize: "1.6rem", lineHeight: 1.8, color: "#1a1a1a" }}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) || "<p style='color:#99989f'>Nothing to preview yet…</p>" }}
                            />
                        )}
                    </div>

                    {/* Excerpt */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", padding: "2rem" }}>
                        <label style={labelStyle}>Excerpt</label>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            placeholder="Short summary shown in article cards and SEO…"
                            rows={3}
                            style={{ ...inputStyle, resize: "vertical" }}
                            onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                            onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                        />
                    </div>
                </div>

                {/* ── Sidebar panels ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>

                    {/* Publish settings */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                        <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #f0f0f0", backgroundColor: "#1a1a1a" }}>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.3rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Publish</h3>
                        </div>
                        <div style={{ padding: "1.6rem" }}>
                            <label style={labelStyle}>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.4rem" }}>
                                <button onClick={() => handleSave(false)} disabled={saving} style={{
                                    flex: 1, padding: "0.9rem", border: "1.5px solid #e8ebed",
                                    borderRadius: "0.6rem", backgroundColor: "#fff",
                                    fontFamily: f, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a",
                                    cursor: "pointer",
                                }}>Save</button>
                                <button onClick={() => handleSave(true)} disabled={saving} style={{
                                    flex: 1, padding: "0.9rem", border: "none",
                                    borderRadius: "0.6rem", backgroundColor: "#ff6b00",
                                    fontFamily: f, fontWeight: 700, fontSize: "1.3rem", color: "#fff",
                                    cursor: "pointer",
                                }}>{status === "publish" ? "Update" : "Publish"}</button>
                            </div>
                            {postLink && (
                                <a href={postLink} target="_blank" style={{
                                    display: "block", marginTop: "1.2rem",
                                    fontFamily: f, fontSize: "1.2rem", color: "#68676d",
                                    textDecoration: "none", textAlign: "center",
                                }}>View post ↗</a>
                            )}
                        </div>
                    </div>

                    {/* Featured image */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                        <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #f0f0f0" }}>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Featured Image</h3>
                        </div>
                        <div style={{ padding: "1.6rem" }}>
                            {featuredImage ? (
                                <div style={{ position: "relative" }}>
                                    <img src={featuredImage} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "0.6rem", display: "block" }} />
                                    <button onClick={() => { setFeaturedImage(""); setFeaturedImageId(null); }} style={{
                                        position: "absolute", top: "0.6rem", right: "0.6rem",
                                        backgroundColor: "rgba(0,0,0,0.7)", color: "#fff",
                                        border: "none", borderRadius: "50%", width: "2.4rem", height: "2.4rem",
                                        cursor: "pointer", fontFamily: f, fontSize: "1.2rem",
                                    }}>✕</button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    <button onClick={openMediaPicker} style={{
                                        padding: "1rem", border: "2px dashed #e8ebed", borderRadius: "0.6rem",
                                        backgroundColor: "#f9fafb", fontFamily: f, fontSize: "1.3rem",
                                        color: "#ff6b00", fontWeight: 700, cursor: "pointer", width: "100%",
                                    }}>🖼 Pick from Media Library</button>
                                    <label style={{
                                        padding: "1rem", border: "2px dashed #e8ebed", borderRadius: "0.6rem",
                                        backgroundColor: uploadingFeatured ? "#f0f0f0" : "#f9fafb",
                                        fontFamily: f, fontSize: "1.3rem",
                                        color: uploadingFeatured ? "#99989f" : "#1a1f71",
                                        fontWeight: 700, cursor: uploadingFeatured ? "not-allowed" : "pointer",
                                        width: "100%", textAlign: "center", boxSizing: "border-box", display: "block",
                                    }}>
                                        {uploadingFeatured ? "⏳ Uploading…" : "📤 Upload from Device"}
                                        <input ref={featuredFileRef} type="file" accept="image/*"
                                            onChange={handleFeaturedUpload} disabled={uploadingFeatured}
                                            style={{ display: "none" }} />
                                    </label>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", textAlign: "center", margin: 0 }}>or paste URL</p>
                                    <input type="url" placeholder="https://…"
                                        style={{ ...inputStyle, fontSize: "1.3rem" }}
                                        onKeyDown={e => { if (e.key === "Enter") { setFeaturedImage((e.target as HTMLInputElement).value); setFeaturedImageId(null); } }}
                                        onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                                        onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Media picker modal */}
                    {showMediaPicker && (
                        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", width: "90%", maxWidth: "80rem", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                <div style={{ padding: "1.6rem 2rem", borderBottom: "1px solid #e8ebed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", margin: 0 }}>Select Featured Image</h3>
                                    <button onClick={() => setShowMediaPicker(false)} style={{ background: "none", border: "none", fontSize: "2rem", cursor: "pointer", color: "#68676d" }}>✕</button>
                                </div>
                                <div style={{ padding: "1.6rem", overflowY: "auto", flex: 1 }}>
                                    {mediaLoading ? (
                                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", textAlign: "center", padding: "4rem" }}>Loading media…</p>
                                    ) : mediaItems.length === 0 ? (
                                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", textAlign: "center", padding: "4rem" }}>No images found.</p>
                                    ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "1rem" }}>
                                            {mediaItems.map(item => (
                                                <div key={item.id}
                                                    onClick={() => { setFeaturedImage(item.source_url); setFeaturedImageId(item.id); setShowMediaPicker(false); }}
                                                    style={{ aspectRatio: "1", borderRadius: "0.6rem", overflow: "hidden", cursor: "pointer", border: "3px solid transparent", transition: "border-color 0.15s" }}
                                                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#ff6b00")}
                                                    onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
                                                >
                                                    <img src={item.source_url} alt={item.title.rendered} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                        <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #f0f0f0" }}>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Categories</h3>
                        </div>
                        <div style={{ padding: "1.6rem", maxHeight: "22rem", overflowY: "auto" }}>
                            {categories.length === 0 ? (
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f" }}>Loading…</p>
                            ) : categories.map(cat => (
                                <label key={cat.id} style={{
                                    display: "flex", alignItems: "center", gap: "0.8rem",
                                    padding: "0.6rem 0", cursor: "pointer",
                                    borderBottom: "1px solid #f9f9f9",
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCats.includes(cat.id)}
                                        onChange={() => toggleCat(cat.id)}
                                        style={{ width: "1.6rem", height: "1.6rem", accentColor: "#ff6b00", cursor: "pointer" }}
                                    />
                                    <span style={{ fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a" }}>{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                        <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #f0f0f0" }}>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Tags</h3>
                        </div>
                        <div style={{ padding: "1.6rem" }}>
                            <input
                                type="text"
                                placeholder="Add tag, press Enter…"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                style={{ ...inputStyle, fontSize: "1.3rem" }}
                                onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                            {tags.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "1rem" }}>
                                    {tags.map(tag => (
                                        <span key={tag} style={{
                                            display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                            padding: "0.4rem 0.9rem", borderRadius: "10rem",
                                            backgroundColor: "#f2f5f6", border: "1px solid #e8ebed",
                                            fontFamily: f, fontSize: "1.2rem", color: "#1a1a1a",
                                        }}>
                                            {tag}
                                            <button onClick={() => removeTag(tag)} style={{
                                                background: "none", border: "none", cursor: "pointer",
                                                color: "#99989f", padding: 0, fontSize: "1.1rem", lineHeight: 1,
                                            }}>✕</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", marginTop: "0.8rem" }}>
                                Separate tags with Enter or comma
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
