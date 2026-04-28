"use client";
import { useState, useEffect, useRef } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface MediaItem {
    id: number;
    source_url: string;
    title: { rendered: string };
    mime_type: string;
    date: string;
    media_details?: { width?: number; height?: number; filesize?: number };
}

export default function MediaPage() {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [token, setToken] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch("/api/admin-token")
            .then(r => r.json())
            .then(d => { if (d.token) setToken(d.token); });
    }, []);

    useEffect(() => {
        if (!token) return;
        loadMedia();
    }, [token, page]);

    async function loadMedia() {
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_WP_API}/media?per_page=24&page=${page}&orderby=date&order=desc`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const total = parseInt(res.headers.get("X-WP-TotalPages") ?? "1");
            setTotalPages(total);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch {
            setError("Failed to load media.");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!token) { setError("Not authenticated. Please log out and log back in."); return; }
        setUploading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API}/media`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Disposition": `attachment; filename="${file.name}"`,
                    "Content-Type": file.type,
                },
                body: file,
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message ?? `Upload failed (${res.status})`);
            }
            const newItem = await res.json();
            setItems(prev => [newItem, ...prev]);
            setSuccess(`"${file.name}" uploaded successfully.`);
            if (fileRef.current) fileRef.current.value = "";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed. Check file type and size.");
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this file permanently?")) return;
        setDeleting(id);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_WP_API}/media/${id}?force=true`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(prev => prev.filter(i => i.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch {
            setError("Delete failed.");
        } finally {
            setDeleting(null);
        }
    }

    function copyUrl(url: string) {
        navigator.clipboard.writeText(url);
        setSuccess("URL copied to clipboard.");
        setTimeout(() => setSuccess(""), 2500);
    }

    function formatSize(bytes?: number) {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const isImage = (mime: string) => mime.startsWith("image/");

    return (
        <div style={{ maxWidth: "120rem" }}>
            {/* Page title */}
            <div style={{ marginBottom: "2.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.2rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Media Library</h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.4rem" }}>Upload and manage your media files</p>
                </div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", padding: "1rem 2rem", backgroundColor: uploading ? "#ccc" : "#ff6b00", color: "#fff", borderRadius: "0.6rem", fontFamily: f, fontWeight: 700, fontSize: "1.4rem", cursor: uploading ? "not-allowed" : "pointer" }}>
                    {uploading ? "Uploading…" : "+ Upload File"}
                    <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
                </label>
            </div>

            {/* Feedback */}
            {error && <div style={{ padding: "1.2rem 1.6rem", backgroundColor: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#dc2626", marginBottom: "1.6rem" }}>{error}</div>}
            {success && <div style={{ padding: "1.2rem 1.6rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", color: "#16a34a", marginBottom: "1.6rem" }}>{success}</div>}

            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 32rem" : "1fr", gap: "2.4rem", alignItems: "start" }}>
                {/* Grid */}
                <div>
                    {loading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "1.2rem" }}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="skeleton" style={{ aspectRatio: "1", borderRadius: "0.8rem" }} />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "6rem 2rem", backgroundColor: "#fff", borderRadius: "1rem", border: "2px dashed #e8ebed" }}>
                            <p style={{ fontFamily: fd, fontSize: "1.8rem", color: "#99989f", marginBottom: "0.8rem" }}>No media yet</p>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#c9c9c9" }}>Upload your first file above</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "1.2rem" }}>
                            {items.map(item => (
                                <div key={item.id} onClick={() => setSelected(item)} style={{ position: "relative", aspectRatio: "1", borderRadius: "0.8rem", overflow: "hidden", cursor: "pointer", border: selected?.id === item.id ? "3px solid #ff6b00" : "3px solid transparent", backgroundColor: "#f2f5f6", transition: "border-color 0.15s" }}>
                                    {isImage(item.mime_type) ? (
                                        <img src={item.source_url} alt={item.title.rendered} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
                                            <span style={{ fontSize: "3.2rem" }}>📄</span>
                                            <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", textAlign: "center", padding: "0 0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{item.title.rendered}</span>
                                        </div>
                                    )}
                                    {/* Hover overlay */}
                                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.15s" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.25)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0)")}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", marginTop: "2.4rem" }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "0.7rem 1.4rem", borderRadius: "0.5rem", border: "1px solid #e8ebed", backgroundColor: "#fff", fontFamily: f, fontSize: "1.3rem", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                            <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "0.7rem 1.4rem", borderRadius: "0.5rem", border: "1px solid #e8ebed", backgroundColor: "#fff", fontFamily: f, fontSize: "1.3rem", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
                        </div>
                    )}
                </div>

                {/* Detail panel */}
                {selected && (
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", overflow: "hidden", position: "sticky", top: "7rem" }}>
                        <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #e8ebed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em" }}>File Details</span>
                            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#99989f", fontSize: "1.8rem", lineHeight: 1 }}>×</button>
                        </div>
                        {isImage(selected.mime_type) && (
                            <div style={{ backgroundColor: "#f2f5f6", padding: "1.2rem" }}>
                                <img src={selected.source_url} alt={selected.title.rendered} style={{ width: "100%", height: "20rem", objectFit: "contain", borderRadius: "0.4rem" }} />
                            </div>
                        )}
                        <div style={{ padding: "1.6rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                            <div>
                                <p style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Filename</p>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a", wordBreak: "break-all" }}>{selected.title.rendered}</p>
                            </div>
                            {selected.media_details?.width && (
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Dimensions</p>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a" }}>{selected.media_details.width} × {selected.media_details.height}px</p>
                                </div>
                            )}
                            {selected.media_details?.filesize && (
                                <div>
                                    <p style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>File Size</p>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a" }}>{formatSize(selected.media_details.filesize)}</p>
                                </div>
                            )}
                            <div>
                                <p style={{ fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>URL</p>
                                <div style={{ display: "flex", gap: "0.6rem" }}>
                                    <input readOnly value={selected.source_url} style={{ flex: 1, padding: "0.6rem 0.8rem", border: "1px solid #e8ebed", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.1rem", color: "#68676d", backgroundColor: "#f9fafb", minWidth: 0 }} />
                                    <button onClick={() => copyUrl(selected.source_url)} style={{ padding: "0.6rem 1rem", backgroundColor: "#1a1a1a", color: "#fff", borderRadius: "0.4rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Copy</button>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.8rem", paddingTop: "0.8rem", borderTop: "1px solid #f0f0f0" }}>
                                <a href={selected.source_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "0.9rem", textAlign: "center", border: "1px solid #e8ebed", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 600, color: "#1a1a1a", textDecoration: "none" }}>View</a>
                                <button onClick={() => handleDelete(selected.id)} disabled={deleting === selected.id} style={{ flex: 1, padding: "0.9rem", backgroundColor: deleting === selected.id ? "#ccc" : "#fee2e2", border: "none", borderRadius: "0.5rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#dc2626", cursor: deleting === selected.id ? "not-allowed" : "pointer" }}>
                                    {deleting === selected.id ? "Deleting…" : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
