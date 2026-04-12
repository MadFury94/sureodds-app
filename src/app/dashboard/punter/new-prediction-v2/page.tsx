"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface League {
    key: string;
    group: string;
    title: string;
    description: string;
    active: boolean;
    has_outrights: boolean;
}

interface Market {
    name: string;
    point?: number;
    avgOdds: string;
    bookmakerCount: number;
}

interface Match {
    id: string;
    sportKey: string;
    sportTitle: string;
    commenceTime: string;
    homeTeam: string;
    awayTeam: string;
    markets: Record<string, Market[]>;
    availableMarkets: string[];
    bookmakerCount: number;
}

interface BetSelection {
    id: string;
    matchId: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    marketType: string;
    outcome: string;
    odds: string;
    confidence: string;
}

const CONFIDENCE_LEVELS = ["Low", "Medium", "High", "Banker"];

const MARKET_LABELS: Record<string, string> = {
    h2h: "Match Result",
    spreads: "Handicap",
    totals: "Over/Under",
    btts: "Both Teams To Score",
};

export default function NewPredictionV2() {
    const router = useRouter();
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingLeagues, setLoadingLeagues] = useState(true);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [betslip, setBetslip] = useState<BetSelection[]>([]);
    const [saving, setSaving] = useState(false);
    const [showLeagueSelector, setShowLeagueSelector] = useState(true);

    // Fetch leagues from Odds API
    useEffect(() => {
        fetch("/api/sports/odds-leagues")
            .then(r => r.json())
            .then(data => {
                setLeagues(data.leagues || []);
            })
            .catch(console.error)
            .finally(() => setLoadingLeagues(false));
    }, []);

    // Fetch matches when league is selected
    useEffect(() => {
        if (!selectedLeague) return;

        setLoadingMatches(true);
        fetch(`/api/sports/odds-matches?sportKey=${selectedLeague.key}`)
            .then(r => r.json())
            .then(data => {
                setMatches(data.matches || []);
                setFilteredMatches(data.matches || []);
            })
            .catch(console.error)
            .finally(() => setLoadingMatches(false));
    }, [selectedLeague]);

    // Filter matches by search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredMatches(matches);
            return;
        }
        const query = searchQuery.toLowerCase();
        setFilteredMatches(
            matches.filter(m =>
                m.homeTeam.toLowerCase().includes(query) ||
                m.awayTeam.toLowerCase().includes(query)
            )
        );
    }, [searchQuery, matches]);

    const addToBetslip = (match: Match, marketType: string, outcome: Market) => {
        const selection: BetSelection = {
            id: Date.now().toString(),
            matchId: match.id,
            league: match.sportTitle,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            matchDate: new Date(match.commenceTime).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            }),
            marketType,
            outcome: outcome.point !== undefined
                ? `${outcome.name} ${outcome.point}`
                : outcome.name,
            odds: outcome.avgOdds,
            confidence: "High",
        };
        setBetslip(prev => [...prev, selection]);
    };

    const removeFromBetslip = (id: string) => {
        setBetslip(prev => prev.filter(b => b.id !== id));
    };

    const updateConfidence = (id: string, confidence: string) => {
        setBetslip(prev =>
            prev.map(bet => (bet.id === id ? { ...bet, confidence } : bet))
        );
    };

    async function postBetslip() {
        if (betslip.length === 0) return;

        setSaving(true);
        try {
            const userRes = await fetch("/api/auth/me");
            const userData = await userRes.json();

            if (!userData.user) {
                alert("You must be logged in");
                setSaving(false);
                return;
            }

            const res = await fetch("/api/betslips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selections: betslip.map(bet => ({
                        league: bet.league,
                        home: bet.homeTeam,
                        away: bet.awayTeam,
                        outcome: bet.outcome,
                        odds: bet.odds,
                        matchDate: bet.matchDate,
                    })),
                    confidence: betslip[0]?.confidence || "High",
                    createdBy: {
                        id: userData.user.id,
                        name: userData.user.name,
                        email: userData.user.email,
                    },
                }),
            });

            if (res.ok) {
                alert("Betslip posted successfully!");
                setBetslip([]);
                router.push("/dashboard/punter/predictions");
            } else {
                alert("Failed to post betslip");
            }
        } catch (error) {
            console.error(error);
            alert("Error posting betslip");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ display: "flex", gap: "2rem", maxWidth: "140rem", margin: "0 auto" }}>
            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "2.4rem" }}>
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
                    <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", margin: "0 0 0.6rem" }}>
                        Post Predictions (Odds API)
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                        Select from all available football leagues and markets worldwide
                    </p>
                </div>

                {/* League Selector */}
                {showLeagueSelector && (
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2rem", marginBottom: "2rem" }}>
                        <h2 style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 1.6rem", textTransform: "uppercase" }}>
                            Select League
                        </h2>

                        {loadingLeagues ? (
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", padding: "3rem 0" }}>
                                Loading leagues from Odds API...
                            </p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(28rem, 1fr))", gap: "1.2rem", maxHeight: "60rem", overflowY: "auto" }}>
                                {leagues.map((league) => (
                                    <button
                                        key={league.key}
                                        onClick={() => {
                                            setSelectedLeague(league);
                                            setShowLeagueSelector(false);
                                        }}
                                        style={{
                                            padding: "1.6rem",
                                            border: "1px solid #e8ebed",
                                            borderRadius: "0.8rem",
                                            backgroundColor: "#fff",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#ff6b00";
                                            e.currentTarget.style.backgroundColor = "#fff5f0";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "#e8ebed";
                                            e.currentTarget.style.backgroundColor = "#fff";
                                        }}
                                    >
                                        <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.4rem" }}>
                                            {league.title}
                                        </p>
                                        <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", margin: 0 }}>
                                            {league.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Matches List */}
                {!showLeagueSelector && selectedLeague && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
                            <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                {selectedLeague.title}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowLeagueSelector(true);
                                    setSelectedLeague(null);
                                }}
                                style={{
                                    padding: "0.8rem 1.6rem",
                                    border: "1px solid #e8ebed",
                                    borderRadius: "0.6rem",
                                    backgroundColor: "#fff",
                                    fontFamily: f,
                                    fontSize: "1.2rem",
                                    color: "#68676d",
                                    cursor: "pointer",
                                }}
                            >
                                Change League
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "1rem 1.2rem",
                                border: "1px solid #e8ebed",
                                borderRadius: "0.6rem",
                                fontFamily: f,
                                fontSize: "1.3rem",
                                marginBottom: "1.6rem",
                            }}
                        />

                        {loadingMatches ? (
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", padding: "3rem 0" }}>
                                Loading matches...
                            </p>
                        ) : filteredMatches.length === 0 ? (
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", padding: "3rem 0" }}>
                                No matches found
                            </p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                                {filteredMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        style={{
                                            backgroundColor: "#fff",
                                            borderRadius: "1rem",
                                            border: "1px solid #e8ebed",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Match Header */}
                                        <div style={{ padding: "1.6rem", backgroundColor: "#f9fafb", borderBottom: "1px solid #e8ebed" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                                                <span style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                    {match.homeTeam} vs {match.awayTeam}
                                                </span>
                                                <button
                                                    onClick={() => router.push(`/dashboard/punter/match-markets/${match.id}?home=${encodeURIComponent(match.homeTeam)}&away=${encodeURIComponent(match.awayTeam)}&sportKey=${match.sportKey}`)}
                                                    style={{
                                                        padding: "0.6rem 1.2rem",
                                                        backgroundColor: "#ff6b00",
                                                        border: "none",
                                                        borderRadius: "0.4rem",
                                                        fontFamily: f,
                                                        fontSize: "1.1rem",
                                                        fontWeight: 700,
                                                        color: "#fff",
                                                        cursor: "pointer",
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    View All Markets
                                                </button>
                                            </div>
                                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: 0 }}>
                                                {new Date(match.commenceTime).toLocaleDateString("en-GB", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })} • {match.bookmakerCount} bookmakers
                                            </p>
                                        </div>

                                        {/* Quick Markets Preview - Show ALL available markets */}
                                        <div style={{ padding: "1.6rem" }}>
                                            {match.availableMarkets.map(marketKey => (
                                                <div key={marketKey} style={{ marginBottom: "1.6rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                                                        <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#68676d", margin: 0, textTransform: "uppercase" }}>
                                                            {MARKET_LABELS[marketKey] || marketKey}
                                                        </p>
                                                        <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>
                                                            {match.markets[marketKey]?.length || 0} options
                                                        </span>
                                                    </div>
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))", gap: "0.8rem" }}>
                                                        {match.markets[marketKey]?.map((outcome, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => addToBetslip(match, marketKey, outcome)}
                                                                style={{
                                                                    padding: "1rem",
                                                                    border: "1px solid #e8ebed",
                                                                    borderRadius: "0.6rem",
                                                                    backgroundColor: "#fff",
                                                                    cursor: "pointer",
                                                                    transition: "all 0.2s",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#fff5f0";
                                                                    e.currentTarget.style.borderColor = "#ff6b00";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                                    e.currentTarget.style.borderColor = "#e8ebed";
                                                                }}
                                                            >
                                                                <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                                                    {outcome.point !== undefined ? `${outcome.name} ${outcome.point}` : outcome.name}
                                                                </div>
                                                                <div style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                                    {outcome.avgOdds}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Betslip Sidebar */}
            <div style={{ width: "36rem", flexShrink: 0, position: "sticky", top: "2rem", height: "fit-content", maxHeight: "calc(100vh - 4rem)", backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", overflow: "hidden" }}>
                <div style={{ padding: "1.6rem", borderBottom: "1px solid #e8ebed", backgroundColor: "#ff6b00" }}>
                    <h3 style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#fff", margin: 0, textTransform: "uppercase" }}>
                        Betslip ({betslip.length})
                    </h3>
                </div>

                {betslip.length === 0 ? (
                    <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
                        <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d" }}>
                            Click betting options to add to your betslip
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "1.6rem", maxHeight: "50rem", overflowY: "auto" }}>
                            {betslip.map((bet) => (
                                <div key={bet.id} style={{ padding: "1.2rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem", marginBottom: "1.2rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                                        <span style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a" }}>
                                            {bet.homeTeam} vs {bet.awayTeam}
                                        </span>
                                        <button
                                            onClick={() => removeFromBetslip(bet.id)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#dc2626",
                                                cursor: "pointer",
                                                fontSize: "1.6rem",
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: "0 0 0.8rem" }}>
                                        {bet.outcome} @ {bet.odds}
                                    </p>
                                    <select
                                        value={bet.confidence}
                                        onChange={(e) => updateConfidence(bet.id, e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem",
                                            border: "1px solid #e8ebed",
                                            borderRadius: "0.4rem",
                                            fontFamily: f,
                                            fontSize: "1.2rem",
                                        }}
                                    >
                                        {CONFIDENCE_LEVELS.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: "1.6rem", borderTop: "1px solid #e8ebed" }}>
                            <button
                                onClick={postBetslip}
                                disabled={saving}
                                style={{
                                    width: "100%",
                                    padding: "1.4rem",
                                    backgroundColor: "#ff6b00",
                                    border: "none",
                                    borderRadius: "0.6rem",
                                    fontFamily: fd,
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    textTransform: "uppercase",
                                    opacity: saving ? 0.6 : 1,
                                }}
                            >
                                {saving ? "Posting..." : "Post Betslip"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
