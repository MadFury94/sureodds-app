"use client";
import { useState, useEffect, useCallback } from "react";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

interface VideoJob {
    id: string;
    status: "queued" | "rendering" | "done" | "failed";
    input: {
        slug: string;
        title: string;
        category: string;
        date: string;
    };
    createdAt: string;
    completedAt?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    attempts: number;
}

const STATUS_COLORS: Record<string, string> = {
    queued: "#f59e0b",
    rendering: "#3b82f6",
    done: "#22c55e",
    failed: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
    queued: "Queued",
    rendering: "Rendering…",
    done: "Done",
    failed: "Failed",
};

export default function VideosPage() {
    const [jobs, setJobs] = useState<VideoJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [form, setForm] = useState({
        slug: "", title: "", image: "", category: "Football",
        excerpt: "", date: new Date().toISOString().split("T")[0],
    });
    const [msg, setMsg] = useState("");

    const loadJobs = useCallback(async () => {
        try {
            const res = await fetch("/api/video/jobs");
            if (res.ok) setJobs(await res.json());
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        loadJobs();
        // Auto-refresh while any job is rendering
        const interval = setInterval(loadJobs, 8000);
        return () => clearInterval(interval);
    }, [loadJobs]);

    async function handleGenerate(e: React.FormEvent) {
        e.preventDefault();
        setGenerating(true);
        setMsg("");
        try {
            const res = await fetch("/api/video/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, date: new Date(form.date).toISOString() }),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg(`Job queued: ${data.jobId}`);
                loadJobs();
            } else {
                setMsg(`Error: ${data.error}`);
            }
        } catch (err) {
            setMsg("Network error. Try again.");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div style={{ padding: "3.2rem", maxWidth: "120rem", margin: "0 auto" }}>

            {/* Header */}
            <div style={{ marginBottom: "3.2rem" }}>
                <h1 style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", margin: "0 0 0.8rem" }}>
                    Video Generation
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    Generate short-form videos (1080×1920) for YouTube Shorts, TikTok and Instagram Reels.
                </p>
            </div>

            {/* Manual trigger form */}
            <div style={{ backgroundColor: "#fff", border: "1.5px solid #e8ebed", borderRadius: "1.2rem", padding: "2.8rem", marginBottom: "4rem" }}>
                <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", textTransform: "uppercase", marginBottom: "2.4rem" }}>
                    Generate Video
                </h2>
                <form onSubmit={handleGenerate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
                    {[
                        { key: "slug", label: "Article Slug", placeholder: "my-article-slug" },
                        { key: "title", label: "Title", placeholder: "Article headline" },
                        { key: "image", label: "Featured Image URL", placeholder: "https://..." },
                        { key: "category", label: "Category", placeholder: "Transfer News" },
                        { key: "date", label: "Publication Date", placeholder: "", type: "date" },
                    ].map(field => (
                        <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                {field.label}
                            </label>
                            <input
                                type={field.type ?? "text"}
                                required={field.key !== "image"}
                                placeholder={field.placeholder}
                                value={(form as never)[field.key]}
                                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                style={{ padding: "1.2rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none" }}
                            />
                        </div>
                    ))}

                    {/* Excerpt spans both columns */}
                    <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#3d3c41", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Excerpt
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Short summary of the article..."
                            value={form.excerpt}
                            onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                            style={{ padding: "1.2rem 1.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a", outline: "none", resize: "vertical" }}
                        />
                    </div>

                    <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "1.6rem" }}>
                        <button
                            type="submit"
                            disabled={generating}
                            style={{ padding: "1.2rem 3.2rem", backgroundColor: generating ? "#68676d" : "#ff6b00", border: "none", borderRadius: "0.6rem", fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#fff", cursor: generating ? "not-allowed" : "pointer", textTransform: "uppercase" }}
                        >
                            {generating ? "Queuing…" : "Generate Video →"}
                        </button>
                        {msg && (
                            <span style={{ fontFamily: f, fontSize: "1.3rem", color: msg.startsWith("Error") ? "#ef4444" : "#22c55e" }}>
                                {msg}
                            </span>
                        )}
                    </div>
                </form>
            </div>

            {/* Job list */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", textTransform: "uppercase", margin: 0 }}>
                        Recent Jobs
                    </h2>
                    <button onClick={loadJobs} style={{ padding: "0.8rem 1.6rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", backgroundColor: "#fff", cursor: "pointer" }}>
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>Loading jobs…</p>
                ) : jobs.length === 0 ? (
                    <div style={{ padding: "4rem", textAlign: "center", backgroundColor: "#f2f5f6", borderRadius: "1.2rem" }}>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>No video jobs yet. Generate one above.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        {jobs.map(job => (
                            <div key={job.id} style={{ backgroundColor: "#fff", border: "1.5px solid #e8ebed", borderRadius: "1rem", padding: "2rem", display: "grid", gridTemplateColumns: job.thumbnailUrl ? "10rem 1fr auto" : "1fr auto", gap: "2rem", alignItems: "center" }}>

                                {/* Thumbnail */}
                                {job.thumbnailUrl && (
                                    <img src={job.thumbnailUrl} alt={job.input.title} style={{ width: "10rem", height: "17.8rem", objectFit: "cover", borderRadius: "0.6rem" }} />
                                )}

                                {/* Info */}
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.6rem" }}>
                                        <span style={{ padding: "0.3rem 1rem", borderRadius: "10rem", backgroundColor: STATUS_COLORS[job.status] + "22", border: `1px solid ${STATUS_COLORS[job.status]}`, fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: STATUS_COLORS[job.status] }}>
                                            {STATUS_LABELS[job.status]}
                                        </span>
                                        <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>
                                            {job.id}
                                        </span>
                                    </div>
                                    <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", margin: "0 0 0.4rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {job.input.title}
                                    </p>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0 }}>
                                        {job.input.category} · {new Date(job.createdAt).toLocaleString("en-GB")}
                                    </p>
                                    {job.error && (
                                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#ef4444", marginTop: "0.4rem" }}>
                                            {job.error}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", flexShrink: 0 }}>
                                    {job.videoUrl && (
                                        <>
                                            <a href={job.videoUrl} target="_blank" rel="noopener noreferrer"
                                                style={{ padding: "0.8rem 1.6rem", backgroundColor: "#1a1a1a", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
                                                Download
                                            </a>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(job.videoUrl!); }}
                                                style={{ padding: "0.8rem 1.6rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.2rem", backgroundColor: "#fff", cursor: "pointer" }}>
                                                Copy URL
                                            </button>
                                        </>
                                    )}
                                    {job.status === "rendering" && (
                                        <div style={{ padding: "0.8rem 1.6rem", backgroundColor: "#eff6ff", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.2rem", color: "#3b82f6", textAlign: "center" }}>
                                            Rendering…
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
