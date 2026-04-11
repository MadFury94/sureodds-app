import { readFileSync } from "fs";
import path from "path";
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
    analysis: string;
    specialist: {
        handle: string;
        name: string;
        avatar: string;
    };
    matchDate: string;
    time: string;
    result: string;
}

function getTips(ids: string): Tip[] {
    try {
        const TIPS_FILE = path.join(process.cwd(), "src/data/tips.json");
        const allTips = JSON.parse(readFileSync(TIPS_FILE, "utf-8"));
        const idArray = ids.split("-").map(id => parseInt(id));
        return allTips.filter((t: Tip) => idArray.includes(t.id));
    } catch {
        return [];
    }
}

export default async function BetslipPage({ params }: { params: Promise<{ ids: string }> }) {
    const { ids } = await params;
    console.log("Betslip IDs:", ids);
    const tips = getTips(ids);
    console.log("Found tips:", tips.length);

    if (tips.length === 0) {
        return (
            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
                <h1 style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem" }}>
                    Betslip Not Found
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>
                    This betslip doesn't exist or has been removed. (Looking for IDs: {ids})
                </p>
            </div>
        );
    }

    const specialist = tips[0].specialist;
    const totalOdds = tips.reduce((acc, tip) => {
        const odds = parseFloat(tip.odds);
        return isNaN(odds) ? acc : acc * odds;
    }, 1);

    return (
        <div style={{ maxWidth: "90rem", margin: "0 auto", padding: "4rem 2rem" }}>
            {/* Header */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1.6rem", border: "2px solid #e8ebed", overflow: "hidden", marginBottom: "2.4rem" }}>
                <div style={{ padding: "3.2rem", backgroundColor: "#ff6b00", color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.6rem", marginBottom: "1.6rem" }}>
                        <div style={{
                            width: "6rem",
                            height: "6rem",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            color: "#ff6b00",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: fd,
                            fontSize: "2.4rem",
                            fontWeight: 700,
                        }}>
                            {specialist.avatar}
                        </div>
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.4rem", textTransform: "uppercase" }}>
                                {specialist.name}'s Betslip
                            </h2>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", margin: 0, opacity: 0.9 }}>
                                {tips.length} Prediction{tips.length !== 1 ? "s" : ""} • Posted {tips[0].time}
                            </p>
                        </div>
                    </div>

                    {totalOdds > 1 && (
                        <div style={{ padding: "1.6rem", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "0.8rem" }}>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", margin: "0 0 0.4rem", opacity: 0.9 }}>
                                Accumulator Odds
                            </p>
                            <p style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, margin: 0 }}>
                                {totalOdds.toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Predictions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                {tips.map((tip, index) => (
                    <div
                        key={tip.id}
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
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: 0 }}>
                                    {tip.league}
                                </p>
                            </div>
                            <h3 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.8rem" }}>
                                {tip.home} vs {tip.away}
                            </h3>
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0 }}>
                                {tip.matchDate}
                            </p>
                        </div>

                        {/* Prediction Details */}
                        <div style={{ padding: "2.4rem" }}>
                            <div style={{ padding: "2rem", backgroundColor: "#fff5f0", borderRadius: "1rem", border: "2px solid #ff6b00", marginBottom: "2rem" }}>
                                <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                    Prediction
                                </p>
                                <p style={{ fontFamily: fd, fontSize: "2.2rem", fontWeight: 700, color: "#ff6b00", margin: 0 }}>
                                    {tip.outcome}
                                </p>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.6rem", marginBottom: "2rem" }}>
                                <div style={{ padding: "1.4rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                        Confidence
                                    </p>
                                    <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                        {tip.confidence}
                                    </p>
                                </div>
                                <div style={{ padding: "1.4rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                        Odds
                                    </p>
                                    <p style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                        {tip.odds}
                                    </p>
                                </div>
                                <div style={{ padding: "1.4rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                        Status
                                    </p>
                                    <p style={{
                                        fontFamily: fd,
                                        fontSize: "1.6rem",
                                        fontWeight: 700,
                                        margin: 0,
                                        color: tip.result === "won" ? "#16a34a" : tip.result === "lost" ? "#dc2626" : "#ca8a04",
                                        textTransform: "uppercase",
                                    }}>
                                        {tip.result}
                                    </p>
                                </div>
                            </div>

                            {tip.analysis && (
                                <div>
                                    <h4 style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem", textTransform: "uppercase" }}>
                                        Analysis
                                    </h4>
                                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", lineHeight: 1.7, margin: 0 }}>
                                        {tip.analysis}
                                    </p>
                                </div>
                            )}
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
