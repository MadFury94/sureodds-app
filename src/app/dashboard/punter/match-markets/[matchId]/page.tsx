"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Market {
    name: string;
    point?: number;
    avgOdds: string;
    bookmakerCount: number;
}

const MARKET_LABELS: Record<string, string> = {
    h2h: "Match Result (1X2)",
    spreads: "Asian Handicap",
    totals: "Over/Under Goals",
    btts: "Both Teams To Score",
    h2h_lay: "Lay Betting",
};

const MARKET_DESCRIPTIONS: Record<string, string> = {
    h2h: "Bet on the final result of the match",
    spreads: "Bet on the match with a goal handicap",
    totals: "Bet on the total number of goals scored",
    btts: "Bet on whether both teams will score",
    h2h_lay: "Lay betting options (betting against an outcome)",
};

export default function MatchMarketsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const matchId = params.matchId as string;
    const homeTeam = searchParams.get("home") || "";
    const awayTeam = searchParams.get("away") || "";
    const sportKey = searchParams.get("sportKey") || "";

    const [markets, setMarkets] = useState<Record<string, Market[]>>({});
    const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

    useEffect(() => {
        if (!sportKey) {
            setLoading(false);
            return;
        }

        fetch(`/api/sports/odds-matches?sportKey=${sportKey}`)
            .then(r => r.json())
            .then(data => {
                const match = data.matches?.find((m: any) => m.id === matchId);
                if (match) {
                    setMarkets(match.markets);
                    setAvailableMarkets(match.availableMarkets);
                    if (match.availableMarkets.length > 0) {
                        setSelectedMarket(match.availableMarkets[0]);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [matchId, sportKey]);

    if (loading) {
        return (
            <div style={{ padding: "4rem", textAlign: "center" }}>
                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                    Loading markets...
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "140rem", margin: "0 auto" }}>
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
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", margin: "0 0 0.8rem" }}>
                    {homeTeam} vs {awayTeam}
                </h1>
                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                    All available betting markets
                </p>
            </div>

            {availableMarkets.length === 0 ? (
                <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", padding: "4rem", textAlign: "center" }}>
                    <div style={{ fontSize: "6rem", marginBottom: "2rem" }}>📊</div>
                    <h2 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 1.2rem" }}>
                        No Markets Available
                    </h2>
                    <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d" }}>
                        No betting markets found for this match.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", gap: "2rem" }}>
                    <div style={{ width: "28rem", flexShrink: 0 }}>
                        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden", position: "sticky", top: "2rem" }}>
                            <div style={{ padding: "1.6rem", backgroundColor: "#f9fafb", borderBottom: "1px solid #e8ebed" }}>
                                <h3 style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", margin: 0, textTransform: "uppercase" }}>
                                    Markets ({availableMarkets.length})
                                </h3>
                            </div>
                            <div style={{ padding: "0.8rem" }}>
                                {availableMarkets.map((marketKey) => (
                                    <button
                                        key={marketKey}
                                        onClick={() => setSelectedMarket(marketKey)}
                                        style={{
                                            width: "100%",
                                            padding: "1.2rem",
                                            border: "none",
                                            borderRadius: "0.6rem",
                                            backgroundColor: selectedMarket === marketKey ? "#fff5f0" : "transparent",
                                            borderLeft: selectedMarket === marketKey ? "3px solid #ff6b00" : "3px solid transparent",
                                            fontFamily: f,
                                            fontSize: "1.3rem",
                                            fontWeight: selectedMarket === marketKey ? 700 : 500,
                                            color: selectedMarket === marketKey ? "#ff6b00" : "#1a1a1a",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.2s",
                                            marginBottom: "0.4rem",
                                        }}
                                    >
                                        {MARKET_LABELS[marketKey] || marketKey}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        {selectedMarket && markets[selectedMarket] && (
                            <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                                <div style={{ padding: "2rem", backgroundColor: "#f9fafb", borderBottom: "1px solid #e8ebed" }}>
                                    <h2 style={{ fontFamily: fd, fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.8rem", textTransform: "uppercase" }}>
                                        {MARKET_LABELS[selectedMarket] || selectedMarket}
                                    </h2>
                                    <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", margin: 0 }}>
                                        {MARKET_DESCRIPTIONS[selectedMarket] || "Betting options for this market"}
                                    </p>
                                </div>

                                <div style={{ padding: "2rem" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))", gap: "1.2rem" }}>
                                        {markets[selectedMarket].map((outcome, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: "1.6rem",
                                                    border: "2px solid #e8ebed",
                                                    borderRadius: "0.8rem",
                                                    backgroundColor: "#fff",
                                                    transition: "all 0.2s",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <div style={{ marginBottom: "1.2rem" }}>
                                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.4rem", textTransform: "uppercase" }}>
                                                        {outcome.point !== undefined ? `${outcome.name} ${outcome.point}` : outcome.name}
                                                    </p>
                                                    <p style={{ fontFamily: fd, fontSize: "3.2rem", fontWeight: 700, color: "#ff6b00", margin: 0, lineHeight: 1 }}>
                                                        {outcome.avgOdds}
                                                    </p>
                                                </div>
                                                <div style={{ paddingTop: "1.2rem", borderTop: "1px solid #e8ebed", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>📊</span>
                                                    <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>
                                                        {outcome.bookmakerCount} bookmaker{outcome.bookmakerCount !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
