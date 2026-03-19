"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const LEAGUES = ["Premier League", "La Liga", "Champions League", "Serie A", "Bundesliga", "Ligue 1", "AFCON", "World Cup", "Other"];
const OUTCOMES = ["Home Win", "Draw", "Away Win"];
const CONFIDENCE = ["Low", "Medium", "High", "Banker"];

const confidenceColors: Record<string, string> = {
    Low: "#99989f", Medium: "#f59e0b", High: "#22c55e", Banker: "#e9173d",
};

interface Prediction {
    id: number;
    punter: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    outcome: string;
    odds: string;
    confidence: string;
    note: string;
    time: string;
    likes: number;
}

const mockPredictions: Prediction[] = [
    { id: 1, punter: "PaulBets", league: "Champions League", homeTeam: "Real Madrid", awayTeam: "Man City", outcome: "Home Win", odds: "2.10", confidence: "High", note: "Madrid always deliver at the Bernabeu. Vinicius in form.", time: "2h ago", likes: 24 },
    { id: 2, punter: "OddsKing", league: "Premier League", homeTeam: "Arsenal", awayTeam: "Chelsea", outcome: "Home Win", odds: "1.85", confidence: "Banker", note: "Arsenal's home record this season is unreal.", time: "3h ago", likes: 41 },
    { id: 3, punter: "TipsterNG", league: "La Liga", homeTeam: "Barcelona", awayTeam: "Atletico", outcome: "Draw", odds: "3.40", confidence: "Medium", note: "Atletico always make it tight. Value in the draw.", time: "5h ago", likes: 17 },
    { id: 4, punter: "FootballGuru", league: "Serie A", homeTeam: "Inter Milan", awayTeam: "Juventus", outcome: "Home Win", odds: "2.25", confidence: "High", note: "Inter are the best team in Italy right now.", time: "6h ago", likes: 33 },
];

export default function BettingPage() {
    const [predictions, setPredictions] = useState<Prediction[]>(mockPredictions);
    const [liked, setLiked] = useState<Set<number>>(new Set());
    const [showForm, setShowForm] = useState(false);
    const [activeLeague, setActiveLeague] = useState("All");

    const [form, setForm] = useState({
        punter: "", league: LEAGUES[0], homeTeam: "", awayTeam: "",
        outcome: OUTCOMES[0], odds: "", confidence: CONFIDENCE[1], note: "",
    });

    function handleLike(id: number) {
        setLiked(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); setPredictions(p => p.map(x => x.id === id ? { ...x, likes: x.likes - 1 } : x)); }
            else { next.add(id); setPredictions(p => p.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x)); }
            return next;
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.punter || !form.homeTeam || !form.awayTeam) return;
        const newPred: Prediction = {
            id: Date.now(), ...form, time: "Just now", likes: 0,
        };
        setPredictions(prev => [newPred, ...prev]);
        setForm({ punter: "", league: LEAGUES[0], homeTeam: "", awayTeam: "", outcome: OUTCOMES[0], odds: "", confidence: CONFIDENCE[1], note: "" });
        setShowForm(false);
    }

    const filtered = activeLeague === "All" ? predictions : predictions.filter(p => p.league === activeLeague);
    const allLeagues = ["All", ...Array.from(new Set(predictions.map(p => p.league)))];

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "1.1rem 1.4rem",
        border: "1.5px solid #e8ebed", borderRadius: "0.6rem",
        fontFamily: f, fontSize: "1.5rem", color: "#1a1a1a",
        backgroundColor: "#fff", outline: "none",
        boxSizing: "border-box",
    };

    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            <PageHeader
                title="Betting Tips"
                subtitle="Community predictions from punters. Drop your tips, back your picks."
                image="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80"
                badge="Community Tips"
                badgeColor="#e9173d"
            />

            {/* Drop tip button — floated below header */}
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "3.2rem 1.2rem 0", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(!showForm)} style={{
                    padding: "1.2rem 2.4rem", backgroundColor: "#e9173d", color: "#fff",
                    border: "none", borderRadius: "0.6rem", fontFamily: fd,
                    fontSize: "1.4rem", fontWeight: 700, cursor: "pointer",
                    letterSpacing: "0.04em",
                }}>
                    + Drop Your Tip
                </button>
            </div>

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem 6rem" }}>

                {/* Submit form */}
                {showForm && (
                    <div style={{ backgroundColor: "#f9f9f9", border: "1.5px solid #e8ebed", borderRadius: "1rem", padding: "3.2rem", marginBottom: "4rem" }}>
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#1a1a1a", marginBottom: "2.4rem" }}>
                            Submit Your Prediction
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.6rem", marginBottom: "1.6rem" }}>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>Your Name / Handle *</label>
                                    <input style={inputStyle} placeholder="e.g. PaulBets" value={form.punter} onChange={e => setForm(p => ({ ...p, punter: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>League</label>
                                    <select style={inputStyle} value={form.league} onChange={e => setForm(p => ({ ...p, league: e.target.value }))}>
                                        {LEAGUES.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>Home Team *</label>
                                    <input style={inputStyle} placeholder="e.g. Arsenal" value={form.homeTeam} onChange={e => setForm(p => ({ ...p, homeTeam: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>Away Team *</label>
                                    <input style={inputStyle} placeholder="e.g. Chelsea" value={form.awayTeam} onChange={e => setForm(p => ({ ...p, awayTeam: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>Prediction</label>
                                    <select style={inputStyle} value={form.outcome} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))}>
                                        {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>Odds</label>
                                    <input style={inputStyle} placeholder="e.g. 2.10" value={form.odds} onChange={e => setForm(p => ({ ...p, odds: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>Confidence</label>
                                    <select style={inputStyle} value={form.confidence} onChange={e => setForm(p => ({ ...p, confidence: e.target.value }))}>
                                        {CONFIDENCE.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: "2rem" }}>
                                <label style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", display: "block", marginBottom: "0.6rem" }}>Analysis / Note</label>
                                <textarea style={{ ...inputStyle, minHeight: "9rem", resize: "vertical" }} placeholder="Why do you back this pick?" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
                            </div>
                            <div style={{ display: "flex", gap: "1.2rem" }}>
                                <button type="submit" style={{
                                    padding: "1.2rem 3.2rem", backgroundColor: "#e9173d", color: "#fff",
                                    border: "none", borderRadius: "0.6rem", fontFamily: fd,
                                    fontSize: "1.4rem", fontWeight: 700, cursor: "pointer",
                                }}>Submit Tip</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{
                                    padding: "1.2rem 2.4rem", backgroundColor: "transparent", color: "#68676d",
                                    border: "1.5px solid #e8ebed", borderRadius: "0.6rem", fontFamily: f,
                                    fontSize: "1.4rem", fontWeight: 600, cursor: "pointer",
                                }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* League filter tabs */}
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "3.2rem" }}>
                    {allLeagues.map(league => (
                        <button key={league} onClick={() => setActiveLeague(league)} style={{
                            padding: "0.7rem 1.6rem", borderRadius: "2rem",
                            border: `2px solid ${activeLeague === league ? "#1a1a1a" : "#e8ebed"}`,
                            backgroundColor: activeLeague === league ? "#1a1a1a" : "#fff",
                            fontFamily: f, fontSize: "1.3rem", fontWeight: 600,
                            color: activeLeague === league ? "#fff" : "#3d3c41",
                            cursor: "pointer",
                        }}>{league}</button>
                    ))}
                </div>

                {/* Stats bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", marginBottom: "3.2rem" }}>
                    {[
                        { label: "Total Tips", value: predictions.length },
                        { label: "Active Punters", value: new Set(predictions.map(p => p.punter)).size },
                        { label: "Bankers Today", value: predictions.filter(p => p.confidence === "Banker").length },
                    ].map(stat => (
                        <div key={stat.label} style={{ backgroundColor: "#f2f5f6", borderRadius: "0.8rem", padding: "2rem", textAlign: "center" }}>
                            <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "3.2rem", color: "#1a1a1a", lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginTop: "0.4rem" }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Predictions list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    {filtered.map(pred => (
                        <div key={pred.id} style={{
                            border: "1.5px solid #e8ebed", borderRadius: "1rem",
                            padding: "2.4rem", backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.6rem", flexWrap: "wrap" }}>

                                {/* Left: match info */}
                                <div style={{ flex: 1, minWidth: "24rem" }}>
                                    {/* League + confidence */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                                        <span style={{
                                            padding: "0.3rem 0.9rem", borderRadius: "0.2rem",
                                            backgroundColor: "#1a1a1a",
                                            fontFamily: f, fontSize: "1.1rem", fontWeight: 700, color: "#fff",
                                            textTransform: "uppercase", letterSpacing: "0.06em",
                                        }}>{pred.league}</span>
                                        <span style={{
                                            padding: "0.3rem 0.9rem", borderRadius: "0.2rem",
                                            backgroundColor: confidenceColors[pred.confidence] + "22",
                                            border: `1px solid ${confidenceColors[pred.confidence]}`,
                                            fontFamily: f, fontSize: "1.1rem", fontWeight: 700,
                                            color: confidenceColors[pred.confidence],
                                        }}>{pred.confidence}</span>
                                    </div>

                                    {/* Match */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "1rem" }}>
                                        <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#1a1a1a" }}>{pred.homeTeam}</span>
                                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f", fontWeight: 600 }}>vs</span>
                                        <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#1a1a1a" }}>{pred.awayTeam}</span>
                                    </div>

                                    {/* Prediction pill */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                                        <span style={{
                                            padding: "0.5rem 1.4rem", borderRadius: "2rem",
                                            backgroundColor: "#e9173d",
                                            fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff",
                                        }}>⚽ {pred.outcome}</span>
                                        {pred.odds && (
                                            <span style={{
                                                padding: "0.5rem 1.2rem", borderRadius: "2rem",
                                                border: "1.5px solid #e8ebed",
                                                fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a",
                                            }}>@ {pred.odds}</span>
                                        )}
                                    </div>

                                    {pred.note && (
                                        <p style={{ fontFamily: f, fontSize: "1.45rem", color: "#3d3c41", lineHeight: 1.6, fontStyle: "italic" }}>
                                            "{pred.note}"
                                        </p>
                                    )}
                                </div>

                                {/* Right: punter + actions */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1.2rem", flexShrink: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                        <div style={{
                                            width: "3.6rem", height: "3.6rem", borderRadius: "50%",
                                            backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <span style={{ fontFamily: fd, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                                                {pred.punter.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a" }}>{pred.punter}</p>
                                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>{pred.time}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleLike(pred.id)} style={{
                                        display: "flex", alignItems: "center", gap: "0.5rem",
                                        padding: "0.6rem 1.4rem", borderRadius: "2rem",
                                        border: `1.5px solid ${liked.has(pred.id) ? "#e9173d" : "#e8ebed"}`,
                                        backgroundColor: liked.has(pred.id) ? "#fff0f3" : "#fff",
                                        fontFamily: f, fontSize: "1.3rem", fontWeight: 700,
                                        color: liked.has(pred.id) ? "#e9173d" : "#68676d",
                                        cursor: "pointer",
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked.has(pred.id) ? "#e9173d" : "none"} stroke={liked.has(pred.id) ? "#e9173d" : "#68676d"} strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                        {pred.likes}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "8rem 0" }}>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>No tips yet</p>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>Be the first to drop a prediction for this league.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
