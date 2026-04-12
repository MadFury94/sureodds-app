import { readFileSync } from "fs";
import path from "path";
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

function getBetslip(id: string): Betslip | null {
    try {
        const BETSLIPS_FILE = path.join(process.cwd(), "src/data/betslips.json");
        const allBetslips = JSON.parse(readFileSync(BETSLIPS_FILE, "utf-8"));
        const idNum = parseInt(id);
        return allBetslips.find((b: any) => b.id === idNum) || null;
    } catch {
        return null;
    }
}

export default async function BetslipPage({ params }: { params: Promise<{ ids: string }> }) {
    const { ids } = await params;
    const betslip = getBetslip(ids);

    if (!betslip) {
        return (
            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
                <h1 style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem" }}>
                    Betslip Not Found
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>
                    This betslip doesn't exist or has been removed.
                </p>
            </div>
        );
    }

    const punterName = betslip.createdBy?.name || "Anonymous";
    const punterInitials = punterName.slice(0, 2).toUpperCase();

    return (
        <div style={{ maxWidth: "90rem", margin: "0 auto", padding: "4rem 2rem" }}>
            {/* Header */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1.6rem", border: "2px solid #e8ebed", overflow: "hidden", marginBottom: "2.4rem" }}>
                <div style={{ padding: "3.2rem", backgroundColor: betslip.isAccumulator ? "#ff6b00" : "#1a1a1a", color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.6rem", marginBottom: "1.6rem" }}>
                        <div style={{
                            width: "6rem",
                            height: "6rem",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            color: betslip.isAccumulator ? "#ff6b00" : "#1a1a1a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: fd,
                            fontSize: "2.4rem",
                            fontWeight: 700,
                        }}>
                            {punterInitials}
                        </div>
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.4rem", textTransform: "uppercase" }}>
                                {punterName}'s {betslip.isAccumulator ? `${betslip.selections.length}x Accumulator` : "Betslip"}
                            </h2>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", margin: 0, opacity: 0.9 }}>
                                {betslip.selections.length} Selection{betslip.selections.length !== 1 ? "s" : ""} • {betslip.confidence} Confidence
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: "1.6rem", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "0.8rem" }}>
                        <p style={{ fontFamily: f, fontSize: "1.3rem", margin: "0 0 0.4rem", opacity: 0.9 }}>
                            Total Odds
                        </p>
                        <p style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, margin: 0 }}>
                            @ {betslip.totalOdds}
                        </p>
                    </div>
                </div>
            </div>

            {/* Selections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                {betslip.selections.map((selection, index) => (
                    <div
                        key={selection.id}
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: "1.2rem",
                            border: "2px solid #e8ebed",
                            overflow: "hidden",
                        }}
                    >
                        {/* Match Header */}
                        <div style={{ padding: "2rem", backgroundColor: "#f9fafb", borderBottom: "1px solid #e8ebed" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                                {betslip.isAccumulator && (
                                    <span style={{
                                        padding: "0.4rem 1rem",
                                        backgroundColor: "#ff6b00",
                                        color: "#fff",
                                        borderRadius: "10rem",
                                        fontFamily: f,
                                        fontSize: "1.2rem",
                                        fontWeight: 700,
                                    }}>
                                        #{index + 1}
                                    </span>
                                )}
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: 0 }}>
                                    {selection.league}
                                </p>
                            </div>
                            <h3 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.8rem" }}>
                                {selection.home} vs {selection.away}
                            </h3>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0 }}>
                                {selection.matchDate}
                            </p>
                        </div>

                        {/* Prediction Details */}
                        <div style={{ padding: "2.4rem" }}>
                            <div style={{ padding: "2rem", backgroundColor: "#fff5f0", borderRadius: "1rem", border: "2px solid #ff6b00", marginBottom: "2rem" }}>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                    Prediction
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                                    <p style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#ff6b00", margin: 0 }}>
                                        {selection.outcome}
                                    </p>
                                    <span style={{
                                        padding: "0.6rem 1.4rem",
                                        borderRadius: "10rem",
                                        border: "2px solid #1a1a1a",
                                        fontFamily: fd,
                                        fontSize: "1.8rem",
                                        fontWeight: 700,
                                        color: "#1a1a1a",
                                    }}>
                                        @ {selection.odds}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.6rem" }}>
                                <div style={{ padding: "1.4rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                        Status
                                    </p>
                                    <p style={{
                                        fontFamily: fd,
                                        fontSize: "1.6rem",
                                        fontWeight: 700,
                                        margin: 0,
                                        color: selection.status === "won" ? "#16a34a" : selection.status === "lost" ? "#dc2626" : "#ca8a04",
                                        textTransform: "uppercase",
                                    }}>
                                        {selection.status}
                                    </p>
                                </div>
                                {(selection.homeScore !== null && selection.awayScore !== null) && (
                                    <div style={{ padding: "1.4rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                        <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                            Score
                                        </p>
                                        <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                            {selection.homeScore} - {selection.awayScore}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: "3.2rem", padding: "2.4rem", backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", textAlign: "center" }}>
                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", margin: 0 }}>
                    💡 These are betting predictions. Please gamble responsibly.
                </p>
            </div>
        </div>
    );
}
