"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

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
    time: string;
    specialist: {
        handle: string;
        name: string;
        avatar: string;
    };
    analysis?: string;
}

export default function AllPredictions() {
    const router = useRouter();
    const [tips, setTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "won" | "lost">("all");

    useEffect(() => {
        fetch("/api/tips")
            .then((r) => r.json())
            .then((data) => {
                setTips(data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredTips = tips.filter((tip) => {
        if (filter === "all") return true;
        return tip.result === filter;
    });

    const stats = {
        total: tips.length,
        pending: tips.filter((t) => t.result === "pending").length,
        won: tips.filter((t) => t.result === "won").length,
        lost: tips.filter((t) => t.result === "lost").length,
    };

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this prediction?")) return;

        try {
            const res = await fetch(`/api/tips/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTips((prev) => prev.filter((t) => t.id !== id));
                alert("Prediction deleted successfully!");
            } else {
                alert("Failed to delete prediction");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting prediction");
        }
    }

    function copyShareLink(id: number) {
        const link = `${window.location.origin}/predictions/${id}`;
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    }

    return (
        <div style={{ maxWidth: "120rem", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "3.2rem" }}>
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
                    All Predictions
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    Manage all your betting predictions
                </p>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1.6rem",
                    marginBottom: "2.4rem",
                }}
            >
                {[
                    { label: "Total", value: stats.total, color: "#1a1a1a", filter: "all" },
                    { label: "Pending", value: stats.pending, color: "#f59e0b", filter: "pending" },
                    { label: "Won", value: stats.won, color: "#22c55e", filter: "won" },
                    { label: "Lost", value: stats.lost, color: "#ef4444", filter: "lost" },
                ].map((stat) => (
                    <button
                        key={stat.filter}
                        onClick={() => setFilter(stat.filter as typeof filter)}
                        style={{
                            padding: "2rem",
                            backgroundColor: "#fff",
                            border: "2px solid",
                            borderColor: filter === stat.filter ? stat.color : "#e8ebed",
                            borderRadius: "1rem",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: f,
                                fontSize: "1.2rem",
                                fontWeight: 700,
                                color: "#99989f",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                margin: "0 0 0.8rem",
                            }}
                        >
                            {stat.label}
                        </p>
                        <p
                            style={{
                                fontFamily: fd,
                                fontSize: "3.2rem",
                                fontWeight: 700,
                                color: stat.color,
                                margin: 0,
                            }}
                        >
                            {loading ? "..." : stat.value}
                        </p>
                    </button>
                ))}
            </div>

            {/* Predictions Table */}
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "1.2rem",
                    border: "1px solid #e8ebed",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        padding: "2rem 2.4rem",
                        borderBottom: "1px solid #e8ebed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h2
                        style={{
                            fontFamily: fd,
                            fontSize: "1.8rem",
                            fontWeight: 700,
                            color: "#1a1a1a",
                            textTransform: "uppercase",
                            margin: 0,
                        }}
                    >
                        {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}{" "}
                        Predictions ({filteredTips.length})
                    </h2>
                    <button
                        onClick={() => router.push("/dashboard/punter/new-prediction")}
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
                        + Add New
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: "4rem", textAlign: "center" }}>
                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                            Loading predictions...
                        </p>
                    </div>
                ) : filteredTips.length === 0 ? (
                    <div style={{ padding: "4rem", textAlign: "center" }}>
                        <div style={{ fontSize: "4.8rem", marginBottom: "1.6rem" }}>🎯</div>
                        <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                            No predictions found
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb" }}>
                                    <th
                                        style={{
                                            padding: "1.2rem 2.4rem",
                                            textAlign: "left",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            color: "#68676d",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        ID
                                    </th>
                                    <th
                                        style={{
                                            padding: "1.2rem 2.4rem",
                                            textAlign: "left",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            color: "#68676d",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        Match
                                    </th>
                                    <th
                                        style={{
                                            padding: "1.2rem 2.4rem",
                                            textAlign: "left",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            color: "#68676d",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        Prediction
                                    </th>
                                    <th
                                        style={{
                                            padding: "1.2rem 2.4rem",
                                            textAlign: "left",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            color: "#68676d",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        Confidence
                                    </th>
                                    <th
                                        style={{
                                            padding: "1.2rem 2.4rem",
                                            textAlign: "left",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            color: "#68676d",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        Status
                                    </th>
                                    <th
                                        style={{
                                            padding: "1.2rem 2.4rem",
                                            textAlign: "right",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            color: "#68676d",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTips.map((tip) => (
                                    <tr
                                        key={tip.id}
                                        style={{ borderBottom: "1px solid #e8ebed" }}
                                    >
                                        <td
                                            style={{
                                                padding: "1.6rem 2.4rem",
                                                fontFamily: f,
                                                fontSize: "1.3rem",
                                                color: "#68676d",
                                            }}
                                        >
                                            #{tip.id}
                                        </td>
                                        <td style={{ padding: "1.6rem 2.4rem" }}>
                                            <p
                                                style={{
                                                    fontFamily: fd,
                                                    fontSize: "1.4rem",
                                                    fontWeight: 700,
                                                    color: "#1a1a1a",
                                                    margin: "0 0 0.4rem",
                                                }}
                                            >
                                                {tip.home} vs {tip.away}
                                            </p>
                                            <p
                                                style={{
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    color: "#68676d",
                                                    margin: 0,
                                                }}
                                            >
                                                {tip.league}
                                            </p>
                                        </td>
                                        <td
                                            style={{
                                                padding: "1.6rem 2.4rem",
                                                fontFamily: f,
                                                fontSize: "1.3rem",
                                                fontWeight: 600,
                                                color: "#ff6b00",
                                            }}
                                        >
                                            {tip.outcome}
                                        </td>
                                        <td
                                            style={{
                                                padding: "1.6rem 2.4rem",
                                                fontFamily: f,
                                                fontSize: "1.3rem",
                                                color: "#1a1a1a",
                                            }}
                                        >
                                            {tip.confidence}
                                        </td>
                                        <td style={{ padding: "1.6rem 2.4rem" }}>
                                            <span
                                                style={{
                                                    padding: "0.6rem 1.2rem",
                                                    backgroundColor:
                                                        tip.result === "won"
                                                            ? "#dcfce7"
                                                            : tip.result === "lost"
                                                                ? "#fee2e2"
                                                                : "#fef3c7",
                                                    color:
                                                        tip.result === "won"
                                                            ? "#16a34a"
                                                            : tip.result === "lost"
                                                                ? "#dc2626"
                                                                : "#ca8a04",
                                                    borderRadius: "0.4rem",
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                {tip.result}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                padding: "1.6rem 2.4rem",
                                                textAlign: "right",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "0.8rem",
                                                    justifyContent: "flex-end",
                                                }}
                                            >
                                                <button
                                                    onClick={() => copyShareLink(tip.id)}
                                                    style={{
                                                        padding: "0.6rem 1.2rem",
                                                        backgroundColor: "#f9fafb",
                                                        border: "1px solid #e8ebed",
                                                        borderRadius: "0.4rem",
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        color: "#68676d",
                                                        cursor: "pointer",
                                                    }}
                                                    title="Copy share link"
                                                >
                                                    📋
                                                </button>
                                                <a
                                                    href={`/predictions/${tip.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        padding: "0.6rem 1.2rem",
                                                        backgroundColor: "#f9fafb",
                                                        border: "1px solid #e8ebed",
                                                        borderRadius: "0.4rem",
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        color: "#68676d",
                                                        textDecoration: "none",
                                                        display: "inline-block",
                                                    }}
                                                    title="View"
                                                >
                                                    👁️
                                                </a>
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/dashboard/punter/predictions/edit/${tip.id}`
                                                        )
                                                    }
                                                    style={{
                                                        padding: "0.6rem 1.2rem",
                                                        backgroundColor: "#fff5f0",
                                                        border: "1px solid #ff6b00",
                                                        borderRadius: "0.4rem",
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        color: "#ff6b00",
                                                        cursor: "pointer",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tip.id)}
                                                    style={{
                                                        padding: "0.6rem 1.2rem",
                                                        backgroundColor: "#fee2e2",
                                                        border: "1px solid #dc2626",
                                                        borderRadius: "0.4rem",
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        color: "#dc2626",
                                                        cursor: "pointer",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
