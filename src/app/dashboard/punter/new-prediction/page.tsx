"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fonts } from "@/lib/config";

const f = fonts.body;
const fd = fonts.display;

interface Competition {
    id: number;
    name: string;
    code: string;
    emblem: string;
    area: string;
}

interface Team {
    id: number;
    name: string;
    shortName: string;
    crest: string;
}

interface Match {
    id: number;
    homeTeam: Team;
    awayTeam: Team;
    utcDate: string;
    competition: { name: string };
}

interface MatchOdds {
    homeWin?: string;
    draw?: string;
    awayWin?: string;
    over15?: string;
    under15?: string;
    over25?: string;
    under25?: string;
    over35?: string;
    under35?: string;
    bttsYes?: string;
    bttsNo?: string;
    estimated: boolean;
    availableMarkets: string[];
}

interface BetSelection {
    id: string;
    matchId: number;
    league: string;
    leagueEmblem: string;
    homeTeam: string;
    awayTeam: string;
    homeCrest: string;
    awayCrest: string;
    matchDate: string;
    outcome: string;
    confidence: string;
    analysis: string;
    odds?: string;
}

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

interface ShareModal {
    show: boolean;
    link: string;
    count: number;
}

const CONFIDENCE_LEVELS = ["Low", "Medium", "High", "Banker"];
const REGIONS = ["All", "Europe", "England", "Spain", "Italy", "Germany", "France", "International"];

const BET_OPTIONS = [
    { label: "Home Win", value: "Home Win" },
    { label: "Draw", value: "Draw" },
    { label: "Away Win", value: "Away Win" },
    { label: "Over 1.5", value: "Over 1.5 Goals" },
    { label: "Over 2.5", value: "Over 2.5 Goals" },
    { label: "Over 3.5", value: "Over 3.5 Goals" },
    { label: "Under 1.5", value: "Under 1.5 Goals" },
    { label: "Under 2.5", value: "Under 2.5 Goals" },
    { label: "Under 3.5", value: "Under 3.5 Goals" },
    { label: "BTTS Yes", value: "Both Teams To Score" },
    { label: "BTTS No", value: "Both Teams Not To Score" },
    { label: "Home or Draw", value: "Home or Draw (1X)" },
    { label: "Away or Draw", value: "Away or Draw (X2)" },
];

export default function NewPrediction() {
    const router = useRouter();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<Competition | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [leagueSearch, setLeagueSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingCompetitions, setLoadingCompetitions] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("All");
    const [betslip, setBetslip] = useState<BetSelection[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [showLeagueSelector, setShowLeagueSelector] = useState(true);
    const [shareModal, setShareModal] = useState<ShareModal>({ show: false, link: "", count: 0 });
    const [matchOdds, setMatchOdds] = useState<Record<number, MatchOdds>>({});
    const [loadingOdds, setLoadingOdds] = useState<Record<number, boolean>>({});

    const showToast = (message: string, type: Toast["type"] = "success") => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    // Fetch odds for a match
    const fetchOddsForMatch = async (match: Match) => {
        if (matchOdds[match.id] || loadingOdds[match.id]) return;

        setLoadingOdds((prev) => ({ ...prev, [match.id]: true }));

        try {
            const response = await fetch(
                `/api/sports/odds?homeTeam=${encodeURIComponent(match.homeTeam.shortName || match.homeTeam.name)}&awayTeam=${encodeURIComponent(match.awayTeam.shortName || match.awayTeam.name)}&league=${encodeURIComponent(selectedLeague?.name || "")}`
            );

            if (response.ok) {
                const odds = await response.json();
                setMatchOdds((prev) => ({ ...prev, [match.id]: odds }));
            }
        } catch (error) {
            console.error("Error fetching odds:", error);
        } finally {
            setLoadingOdds((prev) => ({ ...prev, [match.id]: false }));
        }
    };

    // Get odds for a specific outcome
    const getOddsForOutcome = (matchId: number, outcome: string): string | null => {
        const odds = matchOdds[matchId];
        if (!odds) return null;

        switch (outcome) {
            case "Home Win":
                return odds.homeWin || null;
            case "Draw":
                return odds.draw || null;
            case "Away Win":
                return odds.awayWin || null;
            case "Over 1.5 Goals":
                return odds.over15 || null;
            case "Under 1.5 Goals":
                return odds.under15 || null;
            case "Over 2.5 Goals":
                return odds.over25 || null;
            case "Under 2.5 Goals":
                return odds.under25 || null;
            case "Over 3.5 Goals":
                return odds.over35 || null;
            case "Under 3.5 Goals":
                return odds.under35 || null;
            case "Both Teams To Score":
                return odds.bttsYes || null;
            case "Both Teams Not To Score":
                return odds.bttsNo || null;
            default:
                return null;
        }
    };

    // Check if a betting option is available for a match
    const isBetOptionAvailable = (matchId: number, outcome: string): boolean => {
        const odds = matchOdds[matchId];
        if (!odds || !odds.availableMarkets) return false;
        return odds.availableMarkets.includes(outcome);
    };

    const addToBetslip = (match: Match, outcome: string) => {
        if (!selectedLeague) return;

        // Get the odds for this outcome
        const odds = getOddsForOutcome(match.id, outcome);

        const existingIndex = betslip.findIndex(b => b.matchId === match.id);

        if (existingIndex !== -1) {
            const updated = [...betslip];
            updated[existingIndex] = {
                ...updated[existingIndex],
                outcome,
            };
            setBetslip(updated);
            showToast("Prediction updated!", "info");
        } else {
            const selection: BetSelection = {
                id: Date.now().toString(),
                matchId: match.id,
                league: selectedLeague.name,
                leagueEmblem: selectedLeague.emblem,
                homeTeam: match.homeTeam.shortName || match.homeTeam.name,
                awayTeam: match.awayTeam.shortName || match.awayTeam.name,
                homeCrest: match.homeTeam.crest,
                awayCrest: match.awayTeam.crest,
                matchDate: new Date(match.utcDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                outcome,
                confidence: "High",
                analysis: "",
                odds: odds,
            };
            setBetslip((prev) => [...prev, selection]);
            showToast("Added to betslip!", "success");
        }
    };

    const removeFromBetslip = (id: string) => {
        setBetslip((prev) => prev.filter((p) => p.id !== id));
        showToast("Removed from betslip", "info");
    };

    const updateBetDetails = (id: string, field: keyof BetSelection, value: string) => {
        setBetslip((prev) =>
            prev.map((bet) => (bet.id === id ? { ...bet, [field]: value } : bet))
        );
    };

    async function postAllPredictions() {
        if (betslip.length === 0) return;

        setSaving(true);

        try {
            // Get current user info
            const userRes = await fetch("/api/auth/me");
            const userData = await userRes.json();

            if (!userData.user) {
                showToast("You must be logged in to post predictions", "error");
                setSaving(false);
                return;
            }

            // Create ONE betslip with all selections
            const res = await fetch("/api/betslips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selections: betslip.map(prediction => ({
                        league: prediction.league,
                        leagueEmblem: prediction.leagueEmblem,
                        home: prediction.homeTeam,
                        away: prediction.awayTeam,
                        homeCrest: prediction.homeCrest,
                        awayCrest: prediction.awayCrest,
                        outcome: prediction.outcome,
                        odds: prediction.odds || "TBD",
                        matchDate: prediction.matchDate,
                        analysis: prediction.analysis,
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
                const data = await res.json();
                showToast(`Betslip posted successfully!`, "success");

                // Generate shareable betslip link
                const betslipLink = `${window.location.origin}/betslip/${data.betslip.id}`;

                // Show share modal
                setShareModal({ show: true, link: betslipLink, count: betslip.length });

                setBetslip([]);
            } else {
                showToast("Failed to post betslip", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Error posting betslip", "error");
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        fetch("/api/sports/competitions")
            .then(r => r.json())
            .then(data => {
                setCompetitions(data.competitions || []);
                setFilteredCompetitions(data.competitions || []);
            })
            .catch(console.error)
            .finally(() => setLoadingCompetitions(false));
    }, []);

    // Fetch odds when matches are loaded
    useEffect(() => {
        if (matches.length > 0 && selectedLeague) {
            // Fetch odds for first 5 matches to avoid rate limiting
            matches.slice(0, 5).forEach(match => {
                fetchOddsForMatch(match);
            });
        }
    }, [matches, selectedLeague]);

    useEffect(() => {
        let filtered = competitions;
        if (selectedRegion !== "All") {
            filtered = filtered.filter(c => c.area.includes(selectedRegion));
        }
        if (leagueSearch.trim()) {
            const query = leagueSearch.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.area.toLowerCase().includes(query)
            );
        }
        setFilteredCompetitions(filtered);
    }, [competitions, selectedRegion, leagueSearch]);

    useEffect(() => {
        if (!selectedLeague) return;
        setLoading(true);
        fetch(`/api/sports/scheduled?competition=${selectedLeague.code}`)
            .then(r => r.json())
            .then(data => {
                setMatches(data.matches || []);
                setFilteredMatches(data.matches || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedLeague]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredMatches(matches);
            return;
        }
        const query = searchQuery.toLowerCase();
        setFilteredMatches(
            matches.filter(m =>
                m.homeTeam.name.toLowerCase().includes(query) ||
                m.awayTeam.name.toLowerCase().includes(query) ||
                m.homeTeam.shortName.toLowerCase().includes(query) ||
                m.awayTeam.shortName.toLowerCase().includes(query)
            )
        );
    }, [searchQuery, matches]);

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "1rem 1.2rem",
        border: "1px solid #e8ebed",
        borderRadius: "0.6rem",
        fontFamily: f,
        fontSize: "1.3rem",
        color: "#1a1a1a",
        outline: "none",
    };

    return (
        <div style={{ display: "flex", gap: "2rem", maxWidth: "140rem", margin: "0 auto", minHeight: "100vh" }} className="predictions-layout">
            {/* Share Modal */}
            {shareModal.show && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2000,
                    padding: "2rem",
                }}>
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "1.6rem",
                        maxWidth: "60rem",
                        width: "100%",
                        overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: "3.2rem",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#fff",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: "6rem", marginBottom: "1.6rem" }}>🎉</div>
                            <h2 style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, margin: "0 0 0.8rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                Predictions Posted!
                            </h2>
                            <p style={{ fontFamily: f, fontSize: "1.6rem", margin: 0, opacity: 0.95 }}>
                                {shareModal.count} prediction{shareModal.count !== 1 ? "s" : ""} successfully shared
                            </p>
                        </div>

                        {/* Content */}
                        <div style={{ padding: "3.2rem" }}>
                            <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", marginBottom: "2.4rem", textAlign: "center" }}>
                                Share this betslip link with your subscribers
                            </p>

                            {/* Link Box */}
                            <div style={{
                                padding: "1.6rem",
                                backgroundColor: "#f9fafb",
                                borderRadius: "0.8rem",
                                border: "2px solid #e8ebed",
                                marginBottom: "2.4rem",
                                wordBreak: "break-all",
                            }}>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#1a1a1a", margin: 0 }}>
                                    {shareModal.link}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: "1.2rem" }}>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareModal.link);
                                        showToast("Link copied to clipboard!", "success");
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "1.6rem",
                                        backgroundColor: "#ff6b00",
                                        border: "none",
                                        borderRadius: "0.8rem",
                                        fontFamily: fd,
                                        fontSize: "1.5rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: "pointer",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.8rem",
                                    }}
                                >
                                    📋 Copy Link
                                </button>
                                <a
                                    href={shareModal.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        flex: 1,
                                        padding: "1.6rem",
                                        backgroundColor: "#1a1a1a",
                                        border: "none",
                                        borderRadius: "0.8rem",
                                        fontFamily: fd,
                                        fontSize: "1.5rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: "pointer",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.8rem",
                                    }}
                                >
                                    👁️ View Betslip
                                </a>
                            </div>

                            <button
                                onClick={() => {
                                    setShareModal({ show: false, link: "", count: 0 });
                                    router.push("/dashboard/punter");
                                }}
                                style={{
                                    width: "100%",
                                    marginTop: "1.2rem",
                                    padding: "1.4rem",
                                    backgroundColor: "transparent",
                                    border: "1px solid #e8ebed",
                                    borderRadius: "0.8rem",
                                    fontFamily: f,
                                    fontSize: "1.4rem",
                                    fontWeight: 600,
                                    color: "#68676d",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <div style={{ position: "fixed", top: "2rem", right: "2rem", zIndex: 1000, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            padding: "1.2rem 1.6rem",
                            borderRadius: "0.6rem",
                            backgroundColor: toast.type === "success" ? "#10b981" : toast.type === "error" ? "#ef4444" : "#3b82f6",
                            color: "#fff",
                            fontFamily: f,
                            fontSize: "1.3rem",
                            fontWeight: 600,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            minWidth: "28rem",
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, paddingRight: "2rem" }} className="predictions-main">
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
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 style={{ fontFamily: fd, fontSize: "2.4rem", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.6rem" }}>
                        Post Predictions
                    </h1>
                    <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d" }}>
                        Select matches and click betting options to add to your betslip
                    </p>
                </div>

                {/* League Selector */}
                {showLeagueSelector && (
                    <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e8ebed", padding: "2rem", marginBottom: "2rem" }}>
                        <h2 style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 1.6rem", textTransform: "uppercase" }}>
                            Select League
                        </h2>

                        <div style={{ marginBottom: "1.6rem" }}>
                            <input
                                type="text"
                                placeholder="Search leagues..."
                                value={leagueSearch}
                                onChange={(e) => setLeagueSearch(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.6rem", flexWrap: "wrap" }}>
                            {REGIONS.map((region) => (
                                <button
                                    key={region}
                                    onClick={() => setSelectedRegion(region)}
                                    style={{
                                        padding: "0.6rem 1.2rem",
                                        border: "1px solid",
                                        borderColor: selectedRegion === region ? "#ff6b00" : "#e8ebed",
                                        backgroundColor: selectedRegion === region ? "#fff5f0" : "#fff",
                                        borderRadius: "10rem",
                                        fontFamily: f,
                                        fontSize: "1.2rem",
                                        fontWeight: 600,
                                        color: selectedRegion === region ? "#ff6b00" : "#68676d",
                                        cursor: "pointer",
                                    }}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>

                        {loadingCompetitions ? (
                            <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#68676d", textAlign: "center", padding: "3rem 0" }}>
                                Loading leagues...
                            </p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(24rem, 1fr))", gap: "1.2rem", maxHeight: "40rem", overflowY: "auto" }}>
                                {filteredCompetitions.map((comp) => (
                                    <button
                                        key={comp.id}
                                        onClick={() => {
                                            setSelectedLeague(comp);
                                            setShowLeagueSelector(false);
                                        }}
                                        style={{
                                            padding: "1.2rem",
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
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <img src={comp.emblem} alt="" style={{ width: "3.2rem", height: "3.2rem", objectFit: "contain" }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontFamily: fd, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.2rem" }}>
                                                    {comp.name}
                                                </p>
                                                <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", margin: 0 }}>
                                                    {comp.area}
                                                </p>
                                            </div>
                                        </div>
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
                            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                                <img src={selectedLeague.emblem} alt="" style={{ width: "3.2rem", height: "3.2rem", objectFit: "contain" }} />
                                <h2 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                                    {selectedLeague.name}
                                </h2>
                            </div>
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

                        <div style={{ marginBottom: "1.6rem" }}>
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {loading ? (
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
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                                                    <img src={match.homeTeam.crest} alt="" style={{ width: "2.8rem", height: "2.8rem", objectFit: "contain" }} />
                                                    <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                        {match.homeTeam.shortName || match.homeTeam.name}
                                                    </span>
                                                </div>
                                                <span style={{ fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#68676d", padding: "0 1.6rem" }}>vs</span>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, justifyContent: "flex-end" }}>
                                                    <span style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                        {match.awayTeam.shortName || match.awayTeam.name}
                                                    </span>
                                                    <img src={match.awayTeam.crest} alt="" style={{ width: "2.8rem", height: "2.8rem", objectFit: "contain" }} />
                                                </div>
                                            </div>
                                            <p style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", margin: 0, textAlign: "center" }}>
                                                {new Date(match.utcDate).toLocaleDateString("en-GB", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        {/* Betting Options */}
                                        <div style={{ padding: "1.6rem" }}>
                                            {/* Main markets: Home/Draw/Away */}
                                            {(isBetOptionAvailable(match.id, "Home Win") || isBetOptionAvailable(match.id, "Draw") || isBetOptionAvailable(match.id, "Away Win")) && (
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem", marginBottom: "1.2rem" }}>
                                                    {isBetOptionAvailable(match.id, "Home Win") && (
                                                        <button
                                                            onClick={() => {
                                                                addToBetslip(match, "Home Win");
                                                                if (!matchOdds[match.id]) fetchOddsForMatch(match);
                                                            }}
                                                            style={{
                                                                padding: "1.2rem",
                                                                border: "1px solid",
                                                                borderColor: betslip.some(b => b.matchId === match.id && b.outcome === "Home Win") ? "#ff6b00" : "#e8ebed",
                                                                backgroundColor: betslip.some(b => b.matchId === match.id && b.outcome === "Home Win") ? "#fff5f0" : "#fff",
                                                                borderRadius: "0.6rem",
                                                                cursor: "pointer",
                                                                transition: "all 0.2s",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!betslip.some(b => b.matchId === match.id && b.outcome === "Home Win")) {
                                                                    e.currentTarget.style.backgroundColor = "#f9fafb";
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!betslip.some(b => b.matchId === match.id && b.outcome === "Home Win")) {
                                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                                }
                                                            }}
                                                        >
                                                            <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", marginBottom: "0.4rem" }}>Home</div>
                                                            <div style={{ fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: betslip.some(b => b.matchId === match.id && b.outcome === "Home Win") ? "#ff6b00" : "#1a1a1a" }}>
                                                                {getOddsForOutcome(match.id, "Home Win")}
                                                            </div>
                                                        </button>
                                                    )}

                                                    {isBetOptionAvailable(match.id, "Draw") && (
                                                        <button
                                                            onClick={() => {
                                                                addToBetslip(match, "Draw");
                                                                if (!matchOdds[match.id]) fetchOddsForMatch(match);
                                                            }}
                                                            style={{
                                                                padding: "1.2rem",
                                                                border: "1px solid",
                                                                borderColor: betslip.some(b => b.matchId === match.id && b.outcome === "Draw") ? "#ff6b00" : "#e8ebed",
                                                                backgroundColor: betslip.some(b => b.matchId === match.id && b.outcome === "Draw") ? "#fff5f0" : "#fff",
                                                                borderRadius: "0.6rem",
                                                                cursor: "pointer",
                                                                transition: "all 0.2s",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!betslip.some(b => b.matchId === match.id && b.outcome === "Draw")) {
                                                                    e.currentTarget.style.backgroundColor = "#f9fafb";
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!betslip.some(b => b.matchId === match.id && b.outcome === "Draw")) {
                                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                                }
                                                            }}
                                                        >
                                                            <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", marginBottom: "0.4rem" }}>Draw</div>
                                                            <div style={{ fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: betslip.some(b => b.matchId === match.id && b.outcome === "Draw") ? "#ff6b00" : "#1a1a1a" }}>
                                                                {getOddsForOutcome(match.id, "Draw")}
                                                            </div>
                                                        </button>
                                                    )}

                                                    {isBetOptionAvailable(match.id, "Away Win") && (
                                                        <button
                                                            onClick={() => {
                                                                addToBetslip(match, "Away Win");
                                                                if (!matchOdds[match.id]) fetchOddsForMatch(match);
                                                            }}
                                                            style={{
                                                                padding: "1.2rem",
                                                                border: "1px solid",
                                                                borderColor: betslip.some(b => b.matchId === match.id && b.outcome === "Away Win") ? "#ff6b00" : "#e8ebed",
                                                                backgroundColor: betslip.some(b => b.matchId === match.id && b.outcome === "Away Win") ? "#fff5f0" : "#fff",
                                                                borderRadius: "0.6rem",
                                                                cursor: "pointer",
                                                                transition: "all 0.2s",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!betslip.some(b => b.matchId === match.id && b.outcome === "Away Win")) {
                                                                    e.currentTarget.style.backgroundColor = "#f9fafb";
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!betslip.some(b => b.matchId === match.id && b.outcome === "Away Win")) {
                                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                                }
                                                            }}
                                                        >
                                                            <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d", marginBottom: "0.4rem" }}>Away</div>
                                                            <div style={{ fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: betslip.some(b => b.matchId === match.id && b.outcome === "Away Win") ? "#ff6b00" : "#1a1a1a" }}>
                                                                {getOddsForOutcome(match.id, "Away Win")}
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Other markets: Over/Under/BTTS - only show if available */}
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.8rem" }}>
                                                {BET_OPTIONS.slice(3).filter(option => isBetOptionAvailable(match.id, option.value)).map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            addToBetslip(match, option.value);
                                                            if (!matchOdds[match.id]) fetchOddsForMatch(match);
                                                        }}
                                                        style={{
                                                            padding: "1rem",
                                                            border: "1px solid",
                                                            borderColor: betslip.some(b => b.matchId === match.id && b.outcome === option.value) ? "#ff6b00" : "#e8ebed",
                                                            backgroundColor: betslip.some(b => b.matchId === match.id && b.outcome === option.value) ? "#fff5f0" : "#fff",
                                                            borderRadius: "0.6rem",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            gap: "0.4rem",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!betslip.some(b => b.matchId === match.id && b.outcome === option.value)) {
                                                                e.currentTarget.style.backgroundColor = "#f9fafb";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!betslip.some(b => b.matchId === match.id && b.outcome === option.value)) {
                                                                e.currentTarget.style.backgroundColor = "#fff";
                                                            }
                                                        }}
                                                    >
                                                        <div style={{ fontFamily: f, fontSize: "1.1rem", color: "#68676d" }}>
                                                            {option.label}
                                                        </div>
                                                        <div style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: betslip.some(b => b.matchId === match.id && b.outcome === option.value) ? "#ff6b00" : "#1a1a1a" }}>
                                                            {getOddsForOutcome(match.id, option.value)}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Loading state */}
                                            {loadingOdds[match.id] && (
                                                <div style={{ padding: "1rem", textAlign: "center" }}>
                                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: 0 }}>
                                                        Loading odds...
                                                    </p>
                                                </div>
                                            )}

                                            {/* No odds available */}
                                            {!loadingOdds[match.id] && matchOdds[match.id] && matchOdds[match.id].availableMarkets.length === 0 && (
                                                <div style={{ padding: "1rem", textAlign: "center" }}>
                                                    <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#68676d", margin: 0 }}>
                                                        No odds available for this match
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Betslip Sidebar */}
            <div style={{
                width: "36rem",
                flexShrink: 0,
                position: "sticky",
                top: "2rem",
                height: "fit-content",
                maxHeight: "calc(100vh - 4rem)",
                backgroundColor: "#fff",
                borderRadius: "1rem",
                border: "1px solid #e8ebed",
                overflow: "hidden",
            }} className="betslip-sidebar">
                {/* Header */}
                <div style={{
                    padding: "1.6rem",
                    backgroundColor: "#ff6b00",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontSize: "2rem" }}>🎯</span>
                        <div>
                            <h3 style={{ fontFamily: fd, fontSize: "1.6rem", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                Betslip
                            </h3>
                            <p style={{ fontFamily: f, fontSize: "1.1rem", margin: 0, opacity: 0.9 }}>
                                {betslip.length} selection{betslip.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    {betslip.length > 0 && (
                        <div style={{
                            backgroundColor: "#fff",
                            color: "#ff6b00",
                            width: "2.8rem",
                            height: "2.8rem",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: fd,
                            fontSize: "1.4rem",
                            fontWeight: 700,
                        }}>
                            {betslip.length}
                        </div>
                    )}
                </div>

                {/* Betslip Content */}
                <div style={{ padding: "1.6rem", maxHeight: "calc(100vh - 20rem)", overflowY: "auto" }}>
                    {betslip.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem 1.6rem" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1.2rem" }}>📋</div>
                            <p style={{ fontFamily: fd, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.6rem" }}>
                                Your Betslip is Empty
                            </p>
                            <p style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f", margin: 0 }}>
                                Click on betting options to add predictions
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "1.6rem" }}>
                                {betslip.map((bet) => (
                                    <div
                                        key={bet.id}
                                        style={{
                                            padding: "1.2rem",
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "0.8rem",
                                            border: "1px solid #e8ebed",
                                            position: "relative",
                                        }}
                                    >
                                        {/* Remove button */}
                                        <button
                                            onClick={() => removeFromBetslip(bet.id)}
                                            style={{
                                                position: "absolute",
                                                top: "0.8rem",
                                                right: "0.8rem",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "1.6rem",
                                                color: "#99989f",
                                                padding: "0.2rem",
                                                lineHeight: 1,
                                            }}
                                            title="Remove"
                                        >
                                            ×
                                        </button>

                                        {/* Match */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem", paddingRight: "2rem" }}>
                                            <img src={bet.homeCrest} alt="" style={{ width: "2rem", height: "2rem", objectFit: "contain" }} />
                                            <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                {bet.homeTeam}
                                            </span>
                                            <span style={{ fontFamily: f, fontSize: "1.1rem", color: "#99989f" }}>vs</span>
                                            <span style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>
                                                {bet.awayTeam}
                                            </span>
                                            <img src={bet.awayCrest} alt="" style={{ width: "2rem", height: "2rem", objectFit: "contain" }} />
                                        </div>

                                        {/* Prediction */}
                                        <div style={{
                                            padding: "0.8rem 1rem",
                                            backgroundColor: "#fff",
                                            borderRadius: "0.6rem",
                                            marginBottom: "1rem",
                                        }}>
                                            <p style={{ fontFamily: f, fontSize: "1.2rem", fontWeight: 700, color: "#ff6b00", margin: 0 }}>
                                                {bet.outcome}
                                            </p>
                                        </div>

                                        {/* Confidence */}
                                        <div style={{ marginBottom: "1rem" }}>
                                            <label style={{ display: "block", fontFamily: f, fontSize: "1.1rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                                Confidence
                                            </label>
                                            <select
                                                value={bet.confidence}
                                                onChange={(e) => updateBetDetails(bet.id, "confidence", e.target.value)}
                                                style={{
                                                    width: "100%",
                                                    padding: "0.6rem 0.8rem",
                                                    border: "1px solid #e8ebed",
                                                    borderRadius: "0.4rem",
                                                    fontFamily: f,
                                                    fontSize: "1.2rem",
                                                    color: "#1a1a1a",
                                                    outline: "none",
                                                }}
                                            >
                                                {CONFIDENCE_LEVELS.map((level) => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Analysis */}
                                        <div>
                                            <label style={{ display: "block", fontFamily: f, fontSize: "1.1rem", color: "#68676d", marginBottom: "0.4rem" }}>
                                                Analysis (optional)
                                            </label>
                                            <textarea
                                                value={bet.analysis}
                                                onChange={(e) => updateBetDetails(bet.id, "analysis", e.target.value)}
                                                placeholder="Add your reasoning..."
                                                rows={2}
                                                style={{
                                                    width: "100%",
                                                    padding: "0.6rem 0.8rem",
                                                    border: "1px solid #e8ebed",
                                                    borderRadius: "0.4rem",
                                                    fontFamily: f,
                                                    fontSize: "1.1rem",
                                                    color: "#1a1a1a",
                                                    outline: "none",
                                                    resize: "vertical",
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Post Button */}
                            <button
                                onClick={postAllPredictions}
                                disabled={saving}
                                style={{
                                    width: "100%",
                                    padding: "1.4rem",
                                    backgroundColor: saving ? "#ccc" : "#10b981",
                                    border: "none",
                                    borderRadius: "0.6rem",
                                    fontFamily: fd,
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {saving ? "Posting..." : `Post ${betslip.length} Prediction${betslip.length !== 1 ? "s" : ""}`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
