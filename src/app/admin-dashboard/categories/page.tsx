"use client";
import { useState, useEffect } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const WP_API = process.env.NEXT_PUBLIC_WP_API;

interface WPCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
    description: string;
}

function toSlug(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1.2rem",
    border: "1.5px solid #e8ebed", borderRadius: "0.6rem",
    fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a",
    backgroundColor: "#fff", outline: "none", boxSizing: "border-box",
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<WPCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    async function loadCategories() {
        setLoading(true);
        try {
            const res = await fetch(`${WP_API}/categories?per_page=100&orderby=count&order=desc`, { cache: "no-store" });
            if (res.ok) setCategories(await res.json());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadCategories(); }, []);

    function handleNameChange(val: string) {
        setName(val);
        if (!slugEdited) setSlug(toSlug(val));
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        setStatus(null);
        try {
            // Get token from session
            const tokenRes = await fetch("/api/admin-token");
            const { token } = await tokenRes.json();

            const res = await fetch(`${WP_API}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: name.trim(), slug: slug || toSlug(name), description }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? "Failed to create category");
            setStatus(`✓ Category "${data.name}" created`);
            setName(""); setSlug(""); setDescription(""); setSlugEdited(false);
            await loadCategories();
        } catch (e: unknown) {
            setStatus(`✗ ${e instanceof Error ? e.message : "Error"}`);
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(null), 5000);
        }
    }

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.4rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        Categories
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: "0.4rem 0 0" }}>
                        {loading ? "Loading…" : `${categories.length} categories`}
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 36rem", gap: "2.4rem", alignItems: "start" }}>

                {/* Categories list */}
                <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 14rem 8rem",
                        padding: "1.2rem 2rem", backgroundColor: "#f9f9f9", borderBottom: "1px solid #e8ebed",
                    }}>
                        {["Name", "Slug", "Posts"].map((h, i) => (
                            <span key={i} style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                        ))}
                    </div>

                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 14rem 8rem", padding: "1.4rem 2rem", borderBottom: "1px solid #f0f0f0" }}>
                                <div style={{ height: "1.4rem", backgroundColor: "#f0f0f0", borderRadius: "0.3rem", width: "60%" }} />
                                <div style={{ height: "1.4rem", backgroundColor: "#f0f0f0", borderRadius: "0.3rem", width: "70%" }} />
                                <div style={{ height: "1.4rem", backgroundColor: "#f0f0f0", borderRadius: "0.3rem", width: "40%" }} />
                            </div>
                        ))
                    ) : categories.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center" }}>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>No categories found.</p>
                        </div>
                    ) : categories.map((cat, i) => (
                        <div key={cat.id} style={{
                            display: "grid", gridTemplateColumns: "1fr 14rem 8rem",
                            padding: "1.4rem 2rem", alignItems: "center",
                            borderBottom: i < categories.length - 1 ? "1px solid #f0f0f0" : "none",
                        }}>
                            <div>
                                <p style={{ fontFamily: f, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", margin: 0 }}>{cat.name}</p>
                                {cat.description && (
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.2rem 0 0" }}>{cat.description}</p>
                                )}
                            </div>
                            <span style={{
                                fontFamily: f, fontSize: "1.3rem", color: "#68676d",
                                backgroundColor: "#f2f5f6", padding: "0.3rem 0.8rem",
                                borderRadius: "0.3rem", display: "inline-block",
                            }}>{cat.slug}</span>
                            <a
                                href={`/category/${cat.slug}`}
                                target="_blank"
                                style={{ fontFamily: f, fontSize: "1.3rem", color: cat.count > 0 ? "#1a1a1a" : "#99989f", textDecoration: "none", fontWeight: 600 }}
                            >
                                {cat.count} {cat.count === 1 ? "post" : "posts"} ↗
                            </a>
                        </div>
                    ))}
                </div>

                {/* Create form */}
                <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden", position: "sticky", top: "8rem" }}>
                    <div style={{ padding: "1.6rem 2rem", borderBottom: "1px solid #f0f0f0", backgroundColor: "#1a1a1a" }}>
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.4rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                            Add New Category
                        </h2>
                    </div>
                    <form onSubmit={handleCreate} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                        <div>
                            <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>
                                Name *
                            </label>
                            <input
                                value={name}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="e.g. Bundesliga"
                                required
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                        </div>
                        <div>
                            <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>
                                Slug
                            </label>
                            <input
                                value={slug}
                                onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                                placeholder="auto-generated"
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                            <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f", marginTop: "0.4rem" }}>
                                URL: /category/{slug || toSlug(name) || "…"}
                            </p>
                        </div>
                        <div>
                            <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Optional description…"
                                rows={3}
                                style={{ ...inputStyle, resize: "vertical" }}
                                onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                                onBlur={e => (e.target.style.borderColor = "#e8ebed")}
                            />
                        </div>

                        {status && (
                            <p style={{
                                fontFamily: f, fontSize: "1.3rem", fontWeight: 600,
                                color: status.startsWith("✓") ? "#16a34a" : "#ff6b00",
                                margin: 0,
                            }}>{status}</p>
                        )}

                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            style={{
                                padding: "1.1rem", border: "none", borderRadius: "0.6rem",
                                backgroundColor: saving || !name.trim() ? "#68676d" : "#ff6b00",
                                color: "#fff", fontFamily: f, fontWeight: 700, fontSize: "1.4rem",
                                cursor: saving || !name.trim() ? "not-allowed" : "pointer",
                            }}
                        >
                            {saving ? "Creating…" : "Create Category"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
