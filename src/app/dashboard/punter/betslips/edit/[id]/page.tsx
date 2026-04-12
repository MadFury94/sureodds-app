"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Selection {
    id: string;
    league: string;
    home: string;
    away: string;
    outcome: string;
    odds: string;
    matchDate: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
}

interface Betslip {
    id: number;
    selections: Selection[];
    totalOdds: string;
    confidence: string;
    isAccumulator: boolean;
    status: string;
    createdAt: string;
}

const CONFIDENCE_LEVELS = ["Low", "Medium", "High", "Banker"];

export default function EditBetslip() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [betslip, setBetslip] = useState<Betslip | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        fetch(`/api/betslips/${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.betslip) {
                    // Check if games have started
                    const now = new Date();
                    const hasStarted = data.betslip.selections.some((sel: Selection) => {
                        const matchDate = new Date(sel.matchDate);
                        return matchDate <= now;
                    });

                    if (hasStarted) {
                        setError("Cannot edit betslip - games have already started");
                    }

                    setBetslip(data.betslip);
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load betslip");
                setLoading(false);
            });
    }, [id]);

    const updateConfidence = (confidence: string) => {
        if (!betslip) return;
        setBetslip({ ...betslip, confidence });
    };

    const removeSelection = (selectionId: string) => {
        if (!betslip) return;
        const updated = betslip.selections.filter(s => s.id !== selectionId);
        if (updated.length === 0) {
            alert("Cannot remove all selections. Delete the betslip instead.");
            return;
        }
        setBetslip({ ...betslip, selections: updated });
    };

    async function handleSave() {
        if (!betslip) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/betslips/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selections: betslip.selections,
                    confidence: betslip.confidence,
                }),
            });

            if (res.ok) {
                alert("Betslip updated successfully!");
                router.push("/dashboard/punter/predictions");
            } else {
                alert("Failed to update betslip");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating betslip");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: "4rem", textAlign: "center" }}>
                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                    Loading betslip...
                </p>
            </div>
        );
    }

    if (error || !betslip) {
        return (
            <div style={{ padding: "4rem", textAlign: "center" }}>
                <div style={{ fontSize: "4.8rem", marginBottom: "1.6rem" }}>⚠️</div>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#dc2626", marginBottom: "2rem" }}>
                    {error || "Betslip not found"}
                </p>
                <button
                    onClick={() => router.push("/dashboard/punter/predictions")}
                    style={{
                        padding: "1rem 2rem",
                        backgroundColor: "#ff6b00",
                        border: "none",
                        borderRadius: "0.6rem",
                        fontFamily: fd,
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                        textTransform: "uppercase",
                    }}
                >
                    Back to Betslips
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "90rem", margin: "0 auto" }}>
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
                    ← Back
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
                    Edit Betslip #{betslip.id}
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    {betslip.isAccumulator ? `${betslip.selections.length}x Accumulator` : "Single Bet"}
                </p>
            </div>

            {/* Confidence Selector */}
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "1.2rem",
                    border: "1px solid #e8ebed",
                    padding: "2rem",
                    marginBottom: "2rem",
                }}
            >
                <h3
                    style={{
                        fontFamily: fd,
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        margin: "0 0 1.2rem",
                        textTransform: "uppercase",
                    }}
                >
                    Confidence Level
                </h3>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {CONFIDENCE_LEVELS.map((level) => (
                        <button
                            key={level}
                            onClick={() => updateConfidence(level)}
                            style={{
                                padding: "1rem 2rem",
                                border: "2px solid",
                                borderColor: betslip.confidence === level ? "#ff6b00" : "#e8ebed",
                                backgroundColor: betslip.confidence === level ? "#fff5f0" : "#fff",
                                borderRadius: "0.6rem",
                                fontFamily: f,
                                fontSize: "1.3rem",
                                fontWeight: 700,
                                color: betslip.confidence === level ? "#ff6b00" : "#68676d",
                                cursor: "pointer",
                            }}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selections */}
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "1.2rem",
                    border: "1px solid #e8ebed",
                    padding: "2rem",
                    marginBottom: "2rem",
                }}
            >
                <h3
                    style={{
                        fontFamily: fd,
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        margin: "0 0 1.6rem",
                        textTransform: "uppercase",
                    }}
                >
                    Selections ({betslip.selections.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    {betslip.selections.map((selection, index) => (
                        <div
                            key={selection.id}
                            style={{
                                padding: "1.6rem",
                                backgroundColor: "#f9fafb",
                                borderRadius: "0.8rem",
                                border: "1px solid #e8ebed",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
                                        {betslip.isAccumulator && (
                                            <span
                                                style={{
                                                    fontFamily: fd,
                                                    fontSize: "1.2rem",
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    backgroundColor: "#ff6b00",
                                                    width: "2.4rem",
                                                    height: "2.4rem",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {index + 1}
                                            </span>
                                        )}
                                        <span
                                            style={{
                                                fontFamily: f,
                                                fontSize: "1.1rem",
                                                color: "#68676d",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                            }}
                                        >
                                            {selection.league}
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            fontFamily: fd,
                                            fontSize: "1.5rem",
                                            fontWeight: 700,
                                            color: "#1a1a1a",
                                            margin: "0 0 0.8rem",
                                        }}
                                    >
                                        {selection.home} vs {selection.away}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <span
                                            style={{
                                                padding: "0.4rem 1.2rem",
                                                borderRadius: "10rem",
                                                backgroundColor: "#fff",
                                                border: "1px solid #ff6b00",
                                                fontFamily: f,
                                                fontSize: "1.2rem",
                                                fontWeight: 700,
                                                color: "#ff6b00",
                                            }}
                                        >
                                            {selection.outcome}
                                        </span>
                                        <span
                                            style={{
                                                padding: "0.4rem 1.2rem",
                                                borderRadius: "10rem",
                                                border: "2px solid #1a1a1a",
                                                fontFamily: fd,
                                                fontSize: "1.3rem",
                                                fontWeight: 700,
                                                color: "#1a1a1a",
                                            }}
                                        >
                                            @ {selection.odds}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeSelection(selection.id)}
                                    style={{
                                        padding: "0.8rem 1.2rem",
                                        backgroundColor: "#fee2e2",
                                        border: "1px solid #dc2626",
                                        borderRadius: "0.6rem",
                                        fontFamily: f,
                                        fontSize: "1.2rem",
                                        color: "#dc2626",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1.2rem", justifyContent: "flex-end" }}>
                <button
                    onClick={() => router.push("/dashboard/punter/predictions")}
                    style={{
                        padding: "1.2rem 2.4rem",
                        backgroundColor: "#fff",
                        border: "1px solid #e8ebed",
                        borderRadius: "0.6rem",
                        fontFamily: f,
                        fontSize: "1.4rem",
                        fontWeight: 600,
                        color: "#68676d",
                        cursor: "pointer",
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: "1.2rem 2.4rem",
                        backgroundColor: "#ff6b00",
                        border: "none",
                        borderRadius: "0.6rem",
                        fontFamily: fd,
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "#fff",
                        cursor: saving ? "not-allowed" : "pointer",
                        textTransform: "uppercase",
                        opacity: saving ? 0.6 : 1,
                    }}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
