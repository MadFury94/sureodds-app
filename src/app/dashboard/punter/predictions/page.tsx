"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    time: string;
}

export default function AllBetslips() {
    const router = useRouter();
    const [betslips, setBetslips] = useState<Betslip[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "won" | "lost">("all");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch("/api/betslips")
            .then((r) => r.json())
            .then((data) => {
                setBetslips(data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredBetslips = betslips.filter((betslip) => {
        if (filter === "all") return true;
        return betslip.status === filter;
    });

    const stats = {
        total: betslips.length,
        pending: betslips.filter((b) => b.status === "pending").length,
        won: betslips.filter((b) => b.status === "won").length,
        lost: betslips.filter((b) => b.status === "lost").length,
    };

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this betslip?")) return;

        try {
            const res = await fetch(`/api/betslips/${id}`, { method: "DELETE" });
            if (res.ok) {
                setBetslips((prev) => prev.filter((b) => b.id !== id));
                alert("Betslip deleted successfully!");
            } else {
                alert("Failed to delete betslip");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting betslip");
        }
    }

    async function handleBulkDelete() {
        if (selectedIds.length === 0) {
            alert("Please select betslips to delete");
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedIds.length} betslip(s)?`)) {
            return;
        }

        setDeleting(true);
        try {
            await Promise.all(
                selectedIds.map((id) => fetch(`/api/betslips/${id}`, { method: "DELETE" }))
            );

            setBetslips((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
            setSelectedIds([]);
            alert("Betslips deleted successfully!");
        } catch (error) {
            console.error(error);
            alert("Error deleting betslips");
        } finally {
            setDeleting(false);
        }
    }

    function toggleSelection(id: number) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }

    function toggleSelectAll() {
        if (selectedIds.length === filteredBetslips.length && filteredBetslips.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredBetslips.map((b) => b.id));
        }
    }

    function copyShareLink(id: number) {
        const link = `${window.location.origin}/betslip/${id}`;
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    }

    // Check if betslip can be edited (games haven't started yet)
    function canEdit(betslip: Betslip): boolean {
        const now = new Date();
        return betslip.selections.every((selection) => {
            const matchDate = new Date(selection.matchDate);
            return matchDate > now;
        });
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
                    All Betslips
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    Manage all your betting slips
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
                        Betslips ({filteredBetslips.length})
                    </h2>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={deleting}
                                style={{
                                    padding: "1rem 2rem",
                                    backgroundColor: "#dc2626",
                                    border: "none",
                                    borderRadius: "0.6rem",
                                    fontFamily: fd,
                                    fontSize: "1.3rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: deleting ? "not-allowed" : "pointer",
                                    textTransform: "uppercase",
                                    opacity: deleting ? 0.6 : 1,
                                }}
                            >
                                {deleting ? "Deleting..." : `Delete ${selectedIds.length}`}
                            </button>
                        )}
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
                </div>

                {loading ? (
                    <div style={{ padding: "4rem", textAlign: "center" }}>
                        <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                            Loading betslips...
                        </p>
                    </div>
                ) : filteredBetslips.length === 0 ? (
                    <div style={{ padding: "4rem", textAlign: "center" }}>
                        <div style={{ fontSize: "4.8rem", marginBottom: "1.6rem" }}>🎯</div>
                        <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                            No betslips found
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                        {filteredBetslips.map((betslip) => {
                            const editable = canEdit(betslip);

                            return (
                                <div
                                    key={betslip.id}
                                    style={{
                                        backgroundColor: "#fff",
                                        border: betslip.isAccumulator ? "2px solid #ff6b00" : "1px solid #e8ebed",
                                        borderRadius: "1rem",
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* Betslip Header */}
                                    <div
                                        style={{
                                            padding: "1.6rem 2.4rem",
                                            backgroundColor: betslip.isAccumulator ? "#fff5f0" : "#f9fafb",
                                            borderBottom: "1px solid #e8ebed",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(betslip.id)}
                                                onChange={() => toggleSelection(betslip.id)}
                                                style={{ cursor: "pointer", width: "1.8rem", height: "1.8rem" }}
                                            />
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.4rem" }}>
                                                    {betslip.isAccumulator && (
                                                        <span style={{ fontSize: "1.8rem" }}>🎯</span>
                                                    )}
                                                    <h3
                                                        style={{
                                                            fontFamily: fd,
                                                            fontSize: "1.6rem",
                                                            fontWeight: 700,
                                                            color: betslip.isAccumulator ? "#ff6b00" : "#1a1a1a",
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {betslip.isAccumulator
                                                            ? `${betslip.selections.length}x ACCUMULATOR`
                                                            : `Betslip #${betslip.id}`}
                                                    </h3>
                                                    <span
                                                        style={{
                                                            padding: "0.4rem 0.8rem",
                                                            backgroundColor:
                                                                betslip.status === "won"
                                                                    ? "#dcfce7"
                                                                    : betslip.status === "lost"
                                                                        ? "#fee2e2"
                                                                        : "#fef3c7",
                                                            color:
                                                                betslip.status === "won"
                                                                    ? "#16a34a"
                                                                    : betslip.status === "lost"
                                                                        ? "#dc2626"
                                                                        : "#ca8a04",
                                                            borderRadius: "0.4rem",
                                                            fontFamily: f,
                                                            fontSize: "1.1rem",
                                                            fontWeight: 700,
                                                            textTransform: "uppercase",
                                                        }}
                                                    >
                                                        {betslip.status}
                                                    </span>
                                                </div>
                                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: 0 }}>
                                                    Total Odds: <strong style={{ color: "#ff6b00" }}>@ {betslip.totalOdds}</strong> • Confidence: {betslip.confidence}
                                                    {!editable && <span style={{ color: "#dc2626", marginLeft: "1rem" }}>🔒 Locked (Games started)</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.8rem" }}>
                                            <button
                                                onClick={() => copyShareLink(betslip.id)}
                                                style={{
                                                    padding: "0.8rem 1.6rem",
                                                    backgroundColor: "#f9fafb",
                                                    border: "1px solid #e8ebed",
                                                    borderRadius: "0.6rem",
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    color: "#68676d",
                                                    cursor: "pointer",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                📋 Copy Link
                                            </button>
                                            <a
                                                href={`/betslip/${betslip.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: "0.8rem 1.6rem",
                                                    backgroundColor: "#fff5f0",
                                                    border: "1px solid #ff6b00",
                                                    borderRadius: "0.6rem",
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    color: "#ff6b00",
                                                    textDecoration: "none",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                👁️ View
                                            </a>
                                            {editable && (
                                                <button
                                                    onClick={() => router.push(`/dashboard/punter/betslips/edit/${betslip.id}`)}
                                                    style={{
                                                        padding: "0.8rem 1.6rem",
                                                        backgroundColor: "#fff5f0",
                                                        border: "1px solid #ff6b00",
                                                        borderRadius: "0.6rem",
                                                        fontFamily: f,
                                                        fontSize: "1.2rem",
                                                        color: "#ff6b00",
                                                        cursor: "pointer",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(betslip.id)}
                                                style={{
                                                    padding: "0.8rem 1.6rem",
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
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Selections */}
                                    <div style={{ padding: "2rem 2.4rem" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                            {betslip.selections.map((selection, index) => (
                                                <div
                                                    key={selection.id}
                                                    style={{
                                                        padding: "1.2rem",
                                                        backgroundColor: "#f9fafb",
                                                        borderRadius: "0.8rem",
                                                        border: "1px solid #e8ebed",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.6rem" }}>
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
                                                                fontSize: "1.4rem",
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
                                                                    fontSize: "1.4rem",
                                                                    fontWeight: 700,
                                                                    color: "#1a1a1a",
                                                                }}
                                                            >
                                                                @ {selection.odds}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
