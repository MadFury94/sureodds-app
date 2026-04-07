"use client";
import type { TopScorer } from "@/lib/footballdata";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface TopScorersProps {
    scorers: TopScorer[];
    color: string;
    label: string;
}

export default function TopScorers({ scorers, color, label }: TopScorersProps) {
    if (scorers.length === 0) return null;

    return (
        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
            <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid #e8ebed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Top Scorers</span>
                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>2024/25</span>
            </div>

            {/* Header row */}
            <div className="scorers-table" style={{ padding: "0.6rem 1.4rem", backgroundColor: "#f9fafb", borderBottom: "1px solid #f0f0f0" }}>
                {["#", "Player", "Team", "Goals"].map(h => (
                    <span key={h} style={{ fontFamily: f, fontSize: "1rem", fontWeight: 700, color: "#99989f", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "Player" || h === "Team" ? "left" : "center" }}>{h}</span>
                ))}
            </div>

            {scorers.map((scorer, i) => {
                const isTopScorer = i === 0;
                return (
                    <div key={scorer.player.id} className="scorers-table" style={{
                        padding: "0.8rem 1.4rem",
                        borderBottom: i < scorers.length - 1 ? "1px solid #f5f5f5" : "none",
                        backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                        borderLeft: `3px solid ${isTopScorer ? color : "transparent"}`,
                    }}>
                        <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: isTopScorer ? color : "#99989f", textAlign: "center", alignSelf: "center" }}>{i + 1}</span>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignSelf: "center", minWidth: 0 }}>
                            <span style={{ fontFamily: f, fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scorer.player.name}</span>
                            {scorer.assists !== null && scorer.assists > 0 && (
                                <span style={{ fontFamily: f, fontSize: "1rem", color: "#99989f" }}>{scorer.assists} {scorer.assists === 1 ? "assist" : "assists"}</span>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", alignSelf: "center", minWidth: 0 }}>
                            {scorer.team.crest && (
                                <img src={scorer.team.crest} alt="" width={16} height={16} style={{ width: "1.6rem", height: "1.6rem", objectFit: "contain", flexShrink: 0 }} />
                            )}
                            <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scorer.team.shortName || scorer.team.name}</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", alignSelf: "center" }}>
                            <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a" }}>{scorer.goals}</span>
                            {scorer.penalties !== null && scorer.penalties > 0 && (
                                <span style={{ fontFamily: f, fontSize: "0.9rem", color: "#99989f" }}>({scorer.penalties} pen)</span>
                            )}
                        </div>
                    </div>
                );
            })}

            <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "1rem", height: "1rem", borderRadius: "2px", backgroundColor: color, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>Golden Boot leader</span>
            </div>

            <style jsx>{`
                .scorers-table {
                    display: grid;
                    grid-template-columns: 3rem 1fr 1fr 6rem;
                    gap: 1rem;
                    align-items: start;
                }
            `}</style>
        </div>
    );
}
