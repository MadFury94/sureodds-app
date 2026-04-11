"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

const CONFIDENCE_LEVELS = ["Low", "Medium", "High", "Banker"];
const RESULT_OPTIONS = ["pending", "won", "lost"];

interface Tip {
    id: number;
    league: string;
    home: string;
    away: string;
    outcome: string;
    odds: string;
    confidence: string;
    result: string;
    matchDate: string;
    analysis?: string;
    specialist: {
        handle: string;
        name: string;
        avatar: string;
    };
}

export default function EditPrediction() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tip, setTip] = useState<Tip | null>(null);

    useEffect(() => {
        fetch("/api/tips")
            .then((r) => r.json())
            .then((data) => {
                const found = data.find((t: Tip) => t.id === parseInt(id));
                if (found) {
                    setTip(found);
                } else {
                    alert("Prediction not found");
                    router.push("/dashboard/punter/predictions");
                }
                setLoading(false);
            })
            .catch(() => {
                alert("Error loading prediction");
                router.push("/dashboard/punter/predictions");
            });
    }, [id, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!tip) return;

        setSaving(true);

        try {
            const res = await fetch(`/api/tips/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tip),
            });

            if (res.ok) {
                alert("Prediction updated successfully!");
                router.push("/dashboard/punter/predictions");
            } else {
                alert("Failed to update prediction");
                setSaving(false);
            }
        } catch (error) {
            console.error(error);
            alert("Error updating prediction");
            setSaving(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "1.2rem 1.6rem",
        border: "1px solid #e8ebed",
        borderRadius: "0.6rem",
        fontFamily: f,
        fontSize: "1.4rem",
        color: "#1a1a1a",
        outline: "none",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontFamily: f,
        fontSize: "1.3rem",
        fontWeight: 600,
        color: "#1a1a1a",
        marginBottom: "0.8rem",
    };

    if (loading) {
        return (
            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "4rem 0", textAlign: "center" }}>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    Loading prediction...
                </p>
            </div>
        );
    }

    if (!tip) return null;

    return (
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "3.2rem" }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: "none",
                        border: "none",
                        fontFamily: f,
                        fontSize: "1.3rem",
                        color: "#68676d",
                        cursor: "pointer",
                        marginBottom: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                    }}
                >
                    ← Back to All Predictions
                </button>
                <h1
                    style={{
                        fontFamily: fd,
                        fontSize: "2.8rem",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        margin: "0 0 0.8rem",
                    }}
                >
                    Edit Prediction #{id}
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    Update prediction details and status
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "1.2rem",
                        border: "1px solid #e8ebed",
                        padding: "3.2rem",
                    }}
                >
                    {/* Match Details */}
                    <div style={{ marginBottom: "2.4rem" }}>
                        <h2
                            style={{
                                fontFamily: fd,
                                fontSize: "1.8rem",
                                fontWeight: 700,
                                color: "#1a1a1a",
                                textTransform: "uppercase",
                                marginBottom: "1.6rem",
                            }}
                        >
                            Match Details
                        </h2>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem", marginBottom: "1.6rem" }}>
                            <div>
                                <label style={labelStyle}>Home Team</label>
                                <input
                                    type="text"
                                    value={tip.home}
                                    onChange={(e) => setTip({ ...tip, home: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Away Team</label>
                                <input
                                    type="text"
                                    value={tip.away}
                                    onChange={(e) => setTip({ ...tip, away: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.6rem" }}>
                            <label style={labelStyle}>League</label>
                            <input
                                type="text"
                                value={tip.league}
                                onChange={(e) => setTip({ ...tip, league: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "1.6rem" }}>
                            <label style={labelStyle}>Match Date</label>
                            <input
                                type="text"
                                value={tip.matchDate}
                                onChange={(e) => setTip({ ...tip, matchDate: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g., 11 Apr, 15:00"
                                required
                            />
                        </div>
                    </div>

                    {/* Prediction Details */}
                    <div style={{ marginBottom: "2.4rem" }}>
                        <h2
                            style={{
                                fontFamily: fd,
                                fontSize: "1.8rem",
                                fontWeight: 700,
                                color: "#1a1a1a",
                                textTransform: "uppercase",
                                marginBottom: "1.6rem",
                            }}
                        >
                            Prediction Details
                        </h2>

                        <div style={{ marginBottom: "1.6rem" }}>
                            <label style={labelStyle}>Prediction Outcome</label>
                            <input
                                type="text"
                                value={tip.outcome}
                                onChange={(e) => setTip({ ...tip, outcome: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g., Home Win, Over 2.5 Goals"
                                required
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem", marginBottom: "1.6rem" }}>
                            <div>
                                <label style={labelStyle}>Odds</label>
                                <input
                                    type="text"
                                    value={tip.odds}
                                    onChange={(e) => setTip({ ...tip, odds: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g., 2.10"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Confidence Level</label>
                                <select
                                    value={tip.confidence}
                                    onChange={(e) => setTip({ ...tip, confidence: e.target.value })}
                                    style={inputStyle}
                                    required
                                >
                                    {CONFIDENCE_LEVELS.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.6rem" }}>
                            <label style={labelStyle}>Analysis</label>
                            <textarea
                                value={tip.analysis || ""}
                                onChange={(e) => setTip({ ...tip, analysis: e.target.value })}
                                rows={5}
                                style={{ ...inputStyle, resize: "vertical" }}
                                placeholder="Share your reasoning and analysis..."
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div style={{ marginBottom: "2.4rem" }}>
                        <h2
                            style={{
                                fontFamily: fd,
                                fontSize: "1.8rem",
                                fontWeight: 700,
                                color: "#1a1a1a",
                                textTransform: "uppercase",
                                marginBottom: "1.6rem",
                            }}
                        >
                            Status
                        </h2>

                        <div>
                            <label style={labelStyle}>Result</label>
                            <div style={{ display: "flex", gap: "1.2rem" }}>
                                {RESULT_OPTIONS.map((result) => (
                                    <button
                                        key={result}
                                        type="button"
                                        onClick={() => setTip({ ...tip, result })}
                                        style={{
                                            flex: 1,
                                            padding: "1.2rem",
                                            border: "2px solid",
                                            borderColor: tip.result === result ? "#ff6b00" : "#e8ebed",
                                            backgroundColor: tip.result === result ? "#fff5f0" : "#fff",
                                            borderRadius: "0.6rem",
                                            fontFamily: f,
                                            fontSize: "1.4rem",
                                            fontWeight: 600,
                                            color: tip.result === result ? "#ff6b00" : "#68676d",
                                            cursor: "pointer",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {result}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "1.2rem", justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            style={{
                                padding: "1.2rem 2.4rem",
                                backgroundColor: "#fff",
                                border: "1px solid #e8ebed",
                                borderRadius: "0.6rem",
                                fontFamily: fd,
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                color: "#68676d",
                                cursor: "pointer",
                                textTransform: "uppercase",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: "1.2rem 2.4rem",
                                backgroundColor: saving ? "#ccc" : "#ff6b00",
                                border: "none",
                                borderRadius: "0.6rem",
                                fontFamily: fd,
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                color: "#fff",
                                cursor: saving ? "not-allowed" : "pointer",
                                textTransform: "uppercase",
                            }}
                        >
                            {saving ? "Saving..." : "Update Prediction"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
