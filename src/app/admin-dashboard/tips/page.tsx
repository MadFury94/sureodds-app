"use client";
import { useState, useEffect } from "react";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const CONFIDENCE_OPTIONS = ["Low", "Medium", "High", "Banker"];
const RESULT_OPTIONS = ["pending", "won", "lost"];
const SPECIALISTS = [
    { handle: "Analyst_SO", name: "SO Analyst", avatar: "AN" },
    { handle: "TipMaster", name: "Tip Master", avatar: "TM" },
    { handle: "OddsEdge", name: "Odds Edge", avatar: "OE" },
    { handle: "ProPunter", name: "Pro Punter", avatar: "PP" },
];

interface Specialist { handle: string; name: string; avatar: string; }
interface Tip {
    id: number;
    specialist: Specialist;
    league: string;
    home: string;
    away: string;
    outcome: string;
    odds: string;
    confidence: string;
    analysis: string;
    time: string;
    matchDate: string;
    result: string;
}

const EMPTY_TIP: Omit<Tip, "id"> = {
    specialist: SPECIALISTS[0],
    league: "",
    home: "",
    away: "",
    outcome: "",
    odds: "",
    confidence: "High",
    analysis: "",
    time: "Just now",
    matchDate: "",
    result: "pending",
};

const CONFIDENCE_COLOR: Record<string, string> = {
    Low: "#99989f", Medium: "#f59e0b", High: "#22c55e", Banker: "#ff6b00",
};
const RESULT_STYLE: Record<string, React.CSSProperties> = {
    won: { backgroundColor: "#f0fdf4", border: "1.5px solid #22c55e", color: "#16a34a" },
    lost: { backgroundColor: "#fff1f2", border: "1.5px solid #ff6b00", color: "#ff6b00" },
    pending: { backgroundColor: "#f2f5f6", border: "1.5px solid #e8ebed", color: "#68676d" },
};

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1.2rem",
    border: "1.5px solid #e8ebed", borderRadius: "0.6rem",
    fontFamily: f, fontSize: "1.4rem", color: "#1a1a1a",
    backgroundColor: "#fff", outline: "none", boxSizing: "border-box",
};

export default function TipsAdminPage() {
    const [tips, setTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<Tip, "id">>(EMPTY_TIP);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    async function loadTips() {
        setLoading(true);
        try {
            const res = await fetch("/api/tips");
            setTips(await res.json());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadTips(); }, []);

    function openNew() {
        setEditId(null);
        setForm(EMPTY_TIP);
        setShowForm(true);
    }

    function openEdit(tip: Tip) {
        setEditId(tip.id);
        setForm({ ...tip });
        setShowForm(true);
    }

    function closeForm() { setShowForm(false); setEditId(null); }

    function setField<K extends keyof Omit<Tip, "id">>(key: K, value: Omit<Tip, "id">[K]) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    async function handleSave() {
        if (!form.league || !form.home || !form.away || !form.outcome) {
            setStatus("✗ League, teams and outcome are required.");
            return;
        }
        setSaving(true);
        try {
            const url = editId ? `/api/tips/${editId}` : "/api/tips";
            const method = editId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
            setStatus(`✓ Tip ${editId ? "updated" : "created"}`);
            closeForm();
            await loadTips();
        } catch (e: unknown) {
            setStatus(`✗ ${e instanceof Error ? e.message : "Error"}`);
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(null), 4000);
        }
    }

    async function handleDelete(id: number) {
        try {
            const res = await fetch(`/api/tips/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            setStatus("✓ Tip deleted");
            setDeleteId(null);
            await loadTips();
        } catch {
            setStatus("✗ Delete failed");
        } finally {
            setTimeout(() => setStatus(null), 4000);
        }
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.4rem", flexWrap: "wrap", gap: "1.2rem" }}>
                <div>
                    <h1 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                        Betting Tips
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: "0.4rem 0 0" }}>
                        {loading ? "Loading…" : `${tips.length} tips`}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {status && (
                        <span style={{
                            fontFamily: f, fontSize: "1.3rem",
                            color: status.startsWith("✓") ? "#16a34a" : "#ff6b00",
                            padding: "0.6rem 1.2rem", backgroundColor: "#f2f5f6", borderRadius: "0.6rem",
                        }}>{status}</span>
                    )}
                    <button onClick={openNew} style={{
                        padding: "1rem 2rem", backgroundColor: "#ff6b00", color: "#fff",
                        border: "none", borderRadius: "0.6rem",
                        fontFamily: f, fontWeight: 700, fontSize: "1.3rem", cursor: "pointer",
                    }}>+ New Tip</button>
                </div>
            </div>

            {/* Tips table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px solid #e8ebed", overflow: "hidden" }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 14rem 10rem 8rem 8rem 8rem",
                    padding: "1.2rem 2rem", backgroundColor: "#f9f9f9", borderBottom: "1px solid #e8ebed",
                }}>
                    {["Match", "League", "Outcome", "Odds", "Confidence", ""].map((h, i) => (
                        <span key={i} style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                    ))}
                </div>

                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 14rem 10rem 8rem 8rem 8rem", padding: "1.4rem 2rem", borderBottom: "1px solid #f0f0f0" }}>
                            {Array.from({ length: 5 }).map((_, j) => (
                                <div key={j} style={{ height: "1.4rem", backgroundColor: "#f0f0f0", borderRadius: "0.3rem", width: "70%" }} />
                            ))}
                            <div />
                        </div>
                    ))
                ) : tips.length === 0 ? (
                    <div style={{ padding: "6rem", textAlign: "center" }}>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>No tips yet. <button onClick={openNew} style={{ background: "none", border: "none", color: "#ff6b00", fontFamily: f, fontSize: "1.6rem", fontWeight: 700, cursor: "pointer" }}>Add your first tip →</button></p>
                    </div>
                ) : tips.map((tip, i) => (
                    <div key={tip.id} style={{
                        display: "grid", gridTemplateColumns: "1fr 14rem 10rem 8rem 8rem 8rem",
                        padding: "1.4rem 2rem", alignItems: "center",
                        borderBottom: i < tips.length - 1 ? "1px solid #f0f0f0" : "none",
                    }}>
                        <div>
                            <p style={{ fontFamily: f, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", margin: 0 }}>
                                {tip.home} vs {tip.away}
                            </p>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: "0.2rem 0 0" }}>
                                {tip.matchDate} · {tip.specialist.name}
                            </p>
                        </div>
                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#3d3c41" }}>{tip.league}</span>
                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a", fontWeight: 600 }}>{tip.outcome}</span>
                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a" }}>@ {tip.odds}</span>
                        <span style={{
                            display: "inline-block", padding: "0.3rem 0.8rem", borderRadius: "10rem",
                            fontFamily: f, fontSize: "1.2rem", fontWeight: 700,
                            color: CONFIDENCE_COLOR[tip.confidence] ?? "#68676d",
                            backgroundColor: (CONFIDENCE_COLOR[tip.confidence] ?? "#68676d") + "18",
                            border: `1px solid ${CONFIDENCE_COLOR[tip.confidence] ?? "#68676d"}`,
                        }}>{tip.confidence}</span>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                            <button onClick={() => openEdit(tip)} style={{
                                padding: "0.5rem 1rem", border: "1.5px solid #e8ebed",
                                borderRadius: "0.4rem", backgroundColor: "#fff",
                                fontFamily: f, fontSize: "1.2rem", color: "#1a1a1a", cursor: "pointer",
                            }}>Edit</button>
                            <button onClick={() => setDeleteId(tip.id)} style={{
                                padding: "0.5rem 1rem", border: "1.5px solid #fecdd3",
                                borderRadius: "0.4rem", backgroundColor: "#fff1f2",
                                fontFamily: f, fontSize: "1.2rem", color: "#ff6b00", cursor: "pointer",
                            }}>Del</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete confirm */}
            {deleteId !== null && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
                }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "3.2rem", maxWidth: "40rem", width: "90%", textAlign: "center" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>Delete this tip?</p>
                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", marginBottom: "2.4rem" }}>This cannot be undone.</p>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                            <button onClick={() => setDeleteId(null)} style={{ padding: "1rem 2.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", backgroundColor: "#fff", fontFamily: f, fontWeight: 700, fontSize: "1.4rem", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteId)} style={{ padding: "1rem 2.4rem", border: "none", borderRadius: "0.6rem", backgroundColor: "#ff6b00", color: "#fff", fontFamily: f, fontWeight: 700, fontSize: "1.4rem", cursor: "pointer" }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit form modal */}
            {showForm && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
                    padding: "2rem",
                }}>
                    <div style={{
                        backgroundColor: "#fff", borderRadius: "1.2rem",
                        width: "100%", maxWidth: "64rem",
                        maxHeight: "90vh", overflowY: "auto",
                    }}>
                        {/* Modal header */}
                        <div style={{ padding: "2rem 2.4rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                            <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                                {editId ? "Edit Tip" : "New Tip"}
                            </h2>
                            <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "2rem", color: "#68676d", lineHeight: 1 }}>✕</button>
                        </div>

                        <div style={{ padding: "2.4rem", display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                            {/* Row: league + matchDate */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>League *</label>
                                    <input value={form.league} onChange={e => setField("league", e.target.value)} placeholder="e.g. Premier League" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Match Date</label>
                                    <input value={form.matchDate} onChange={e => setField("matchDate", e.target.value)} placeholder="e.g. Today, 20:00" style={inputStyle} />
                                </div>
                            </div>

                            {/* Row: home + away */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Home Team *</label>
                                    <input value={form.home} onChange={e => setField("home", e.target.value)} placeholder="e.g. Arsenal" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Away Team *</label>
                                    <input value={form.away} onChange={e => setField("away", e.target.value)} placeholder="e.g. Chelsea" style={inputStyle} />
                                </div>
                            </div>

                            {/* Row: outcome + odds */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Outcome *</label>
                                    <input value={form.outcome} onChange={e => setField("outcome", e.target.value)} placeholder="e.g. Home Win" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Odds</label>
                                    <input value={form.odds} onChange={e => setField("odds", e.target.value)} placeholder="e.g. 1.85" style={inputStyle} />
                                </div>
                            </div>

                            {/* Row: confidence + result */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Confidence</label>
                                    <select value={form.confidence} onChange={e => setField("confidence", e.target.value)} style={inputStyle}>
                                        {CONFIDENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Result</label>
                                    <select value={form.result} onChange={e => setField("result", e.target.value)} style={inputStyle}>
                                        {RESULT_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Specialist */}
                            <div>
                                <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Specialist</label>
                                <select
                                    value={form.specialist.handle}
                                    onChange={e => {
                                        const s = SPECIALISTS.find(sp => sp.handle === e.target.value) ?? SPECIALISTS[0];
                                        setField("specialist", s);
                                    }}
                                    style={inputStyle}
                                >
                                    {SPECIALISTS.map(s => <option key={s.handle} value={s.handle}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Analysis */}
                            <div>
                                <label style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.6rem" }}>Analysis</label>
                                <textarea
                                    value={form.analysis}
                                    onChange={e => setField("analysis", e.target.value)}
                                    placeholder="Expert analysis for this tip…"
                                    rows={4}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>

                            {/* Result preview */}
                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>Result preview:</span>
                                <span style={{ padding: "0.4rem 1rem", borderRadius: "10rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, ...RESULT_STYLE[form.result] }}>
                                    {form.result === "won" ? "✓ Won" : form.result === "lost" ? "✗ Lost" : "⏳ Pending"}
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", paddingTop: "0.8rem", borderTop: "1px solid #f0f0f0" }}>
                                <button onClick={closeForm} style={{ padding: "1rem 2.4rem", border: "1.5px solid #e8ebed", borderRadius: "0.6rem", backgroundColor: "#fff", fontFamily: f, fontWeight: 700, fontSize: "1.4rem", cursor: "pointer" }}>Cancel</button>
                                <button onClick={handleSave} disabled={saving} style={{ padding: "1rem 2.8rem", border: "none", borderRadius: "0.6rem", backgroundColor: saving ? "#68676d" : "#ff6b00", color: "#fff", fontFamily: f, fontWeight: 700, fontSize: "1.4rem", cursor: saving ? "not-allowed" : "pointer" }}>
                                    {saving ? "Saving…" : editId ? "Update Tip" : "Create Tip"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
