"use client";
import { useState, useEffect, useRef } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface WPCategory { id: number; name: string; slug: string; }

const STATUS_OPTIONS = ["draft", "publish", "pending"];

export default function NewPostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [status, setStatus] = useState("draft");
    const [categories, setCategories] = useState<WPCategory[]>([]);
    const [selectedCats, setSelectedCats] = useState<number[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [featuredImage, setFeaturedImage] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState<"idle" | "saving" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetch("/api/wordpress-auth")
            .then(r => r.json())
            .then(d => { if (!d.valid) window.location.href = "/admin-login"; })
            .catch(() => { });

        fetch(`${process.env.NEXT_PUBLIC_WP_API}/categories?per_page=100`)
            .then(r => r.json())
            .then(setCategories)
            .catch(() => { });
    }, []);

    function addTag(e: React.KeyboardEvent) {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const t = tagInput.trim().replace(/,$/, "");
            if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
            setTagInput("");
        }
    }

    function removeTag(t: string) { setTags(prev => prev.filter(x => x !== t)); }

    function toggleCat(id: number) {
        setSelectedCats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    // Auto-resize textarea
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
            // Get session token from cookie via API
            const sessionRes = await fetch("/api/wordpress-auth");
            const sessionData = await sessionRes.json();
            if (!sessionData.valid) { window.location.href = "/admin-login"; return; }

            // Get the raw token from the session cookie (server reads it)
            const tokenRes = await fetch("/api/admin-token");
            const { token } = await tokenRes.json();

            const WP_API = process.env.NEXT_PUBLIC_WP_API;

            // Create or get tag IDs
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
                } catch { /* skip tag */ }
            }

            const body: Record<string, unknown> = {
                title,
                content,
                excerpt,
                status: publishNow ? "publish" : status,
                categories: selectedCats,
                tags: tagIds,
            };

            if (featuredImage) body.jetpack_featured_media_url = featuredImage;

            const res = await fetch(`${WP_API}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message ?? "Failed to save post.");
            }

            const post = await res.json();
            setSaved("success");
            setTimeout(() => {
                window.location.href = `/admin-dashboard/posts`;
            }, 1200);

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

    return (
        <div>
            {/* Page header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.4rem", flexWrap: "wrap", gap: "1.2rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        New Post
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: "0.4rem 0 0" }}>
                        Write and publish to WordPress
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
                        {saving ? "Publishing…" : "Publish →"}
                    </button>
                </div>
            </div>

            {/* Status messages */}
            {saved === "success" && (
                <div style={{ padding: "1.2rem 1.6rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.6rem", marginBottom: "1.6rem", fontFamily: f, fontSize: "1.4rem", color: "#16a34a", fontWeight: 600 }}>
                    ✓ Post saved successfully! Redirecting…
                </div>
            )}
            {(saved === "error" || errorMsg) && (
                <div style={{ padding: "1.2rem 1.6rem", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.6rem", marginBottom: "1.6rem", fontFamily: f, fontSize: "1.4rem", color: "#ff6b00", fontWeight: 600 }}>
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
                        {title && (
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", marginTop: "0.8rem" }}>
                                Slug: <span style={{ color: "#68676d" }}>{title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}</span>
                            </p>
                        )}
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
                            {/* Toolbar */}
                            {activeTab === "write" && (
                                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", padding: "0 1.2rem" }}>
                                    {[
                                        { label: "B", action: () => setContent(c => c + "**bold**"), title: "Bold" },
                                        { label: "I", action: () => setContent(c => c + "*italic*"), title: "Italic" },
                                        { label: "H2", action: () => setContent(c => c + "\n## Heading\n"), title: "Heading" },
                                        { label: "🔗", action: () => setContent(c => c + "[link text](url)"), title: "Link" },
                                        { label: "⋯", action: () => setContent(c => c + "\n---\n"), title: "Divider" },
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
                                placeholder="Start writing your post… (HTML or plain text)"
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
                                dangerouslySetInnerHTML={{ __html: content || "<p style='color:#99989f'>Nothing to preview yet…</p>" }}
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
                                }}>Save Draft</button>
                                <button onClick={() => handleSave(true)} disabled={saving} style={{
                                    flex: 1, padding: "0.9rem", border: "none",
                                    borderRadius: "0.6rem", backgroundColor: "#ff6b00",
                                    fontFamily: f, fontWeight: 700, fontSize: "1.3rem", color: "#fff",
                                    cursor: "pointer",
                                }}>Publish</button>
                            </div>
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
                                    <button onClick={() => setFeaturedImage("")} style={{
                                        position: "absolute", top: "0.6rem", right: "0.6rem",
                                        backgroundColor: "rgba(0,0,0,0.7)", color: "#fff",
                                        border: "none", borderRadius: "50%", width: "2.4rem", height: "2.4rem",
                                        cursor: "pointer", fontFamily: f, fontSize: "1.2rem",
                                    }}>✕</button>
                                </div>
                            ) : (
                                <div style={{ border: "2px dashed #e8ebed", borderRadius: "0.6rem", padding: "2.4rem", textAlign: "center" }}>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f", margin: "0 0 1rem" }}>Paste image URL</p>
                                    <input
                                        type="url"
                                        placeholder="https://…"
                                        style={{ ...inputStyle, fontSize: "1.3rem" }}
                                        onKeyDown={e => { if (e.key === "Enter") setFeaturedImage((e.target as HTMLInputElement).value); }}
                                        onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                                        onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                        <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #f0f0f0" }}>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.3rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Categories</h3>
                        </div>
                        <div style={{ padding: "1.6rem", maxHeight: "22rem", overflowY: "auto" }}>
                            {categories.length === 0 ? (
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f" }}>Loading categories…</p>
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
                                    <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", marginLeft: "auto" }}></span>
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
