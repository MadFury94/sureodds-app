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

function getTip(id: string): Tip | null {
    try {
        const TIPS_FILE = path.join(process.cwd(), "src/data/tips.json");
        const tips = JSON.parse(readFileSync(TIPS_FILE, "utf-8"));
        return tips.find((t: Tip) => t.id === parseInt(id)) || null;
    } catch {
        return null;
    }
}

export default async function PredictionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tip = getTip(id);

    if (!tip) {
        return (
            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
                <h1 style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem" }}>
                    Prediction Not Found
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d" }}>
                    This prediction doesn't exist or has been removed.
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "4rem 2rem" }}>
            <div style={{ backgroundColor: "#fff", borderRadius: "1.6rem", border: "2px solid #e8ebed", overflow: "hidden" }}>
                {/* Header */}
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
                            {tip.specialist.avatar}
                        </div>
                        <div>
                            <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.4rem", textTransform: "uppercase" }}>
                                {tip.specialist.name}
                            </h2>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", margin: 0, opacity: 0.9 }}>
                                @{tip.specialist.handle}
                            </p>
                        </div>
                    </div>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", margin: 0, opacity: 0.8 }}>
                        Posted {tip.time} • {tip.matchDate}
                    </p>
                </div>

                {/* Match Details */}
                <div style={{ padding: "3.2rem" }}>
                    <div style={{ marginBottom: "2.4rem" }}>
                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                            {tip.league}
                        </p>
                        <h1 style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 1.6rem", lineHeight: 1.2 }}>
                            {tip.home} vs {tip.away}
                        </h1>
                    </div>

                    {/* Prediction */}
                    <div style={{ padding: "2.4rem", backgroundColor: "#fff5f0", borderRadius: "1.2rem", border: "2px solid #ff6b00", marginBottom: "2.4rem" }}>
                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                            Prediction
                        </p>
                        <p style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#ff6b00", margin: 0 }}>
                            {tip.outcome}
                        </p>
                    </div>

                    {/* Meta Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.6rem", marginBottom: "2.4rem" }}>
                        <div style={{ padding: "1.6rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                Confidence
                            </p>
                            <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                {tip.confidence}
                            </p>
                        </div>
                        <div style={{ padding: "1.6rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                Odds
                            </p>
                            <p style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                {tip.odds}
                            </p>
                        </div>
                        <div style={{ padding: "1.6rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                Status
                            </p>
                            <p style={{
                                fontFamily: fd,
                                fontSize: "1.8rem",
                                fontWeight: 700,
                                margin: 0,
                                color: tip.result === "won" ? "#16a34a" : tip.result === "lost" ? "#dc2626" : "#ca8a04",
                                textTransform: "uppercase",
                            }}>
                                {tip.result}
                            </p>
                        </div>
                    </div>

                    {/* Analysis */}
                    {tip.analysis && (
                        <div>
                            <h3 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.2rem", textTransform: "uppercase" }}>
                                Analysis
                            </h3>
                            <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", lineHeight: 1.7, margin: 0 }}>
                                {tip.analysis}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "2.4rem 3.2rem", backgroundColor: "#f9fafb", borderTop: "1px solid #e8ebed" }}>
                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0, textAlign: "center" }}>
                        💡 This is a betting prediction. Please gamble responsibly.
                    </p>
                </div>
            </div>
        </div>
    );
}
