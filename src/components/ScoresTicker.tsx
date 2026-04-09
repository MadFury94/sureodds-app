import { getRecentMatches, getUpcomingMatches, getLiveMatches, type MatchCard } from "@/lib/footballdata";
import TickerScroll from "./TickerScroll";

// Fetch live matches first, then recent results (sorted by date), then upcoming matches
async function getTickerData(): Promise<MatchCard[]> {
    try {
        // 1. Get live matches (highest priority)
        const liveMatches = await getLiveMatches();

        // 2. Get recent finished matches from top leagues
        const [eplRecent, laLigaRecent, uclRecent] = await Promise.all([
            getRecentMatches("PL", 4),
            getRecentMatches("PD", 4),
            getRecentMatches("CL", 4),
        ]);

        // Combine and sort recent matches by date (most recent first)
        const allRecent = [...eplRecent, ...laLigaRecent, ...uclRecent];
        allRecent.sort((a, b) => {
            const dateA = new Date(a.utcDate || 0).getTime();
            const dateB = new Date(b.utcDate || 0).getTime();
            return dateB - dateA; // Most recent first
        });

        // 3. Get upcoming matches (lower priority)
        const [eplNext, laLigaNext, uclNext] = await Promise.all([
            getUpcomingMatches("PL", 2),
            getUpcomingMatches("PD", 2),
            getUpcomingMatches("CL", 2),
        ]);

        // Combine: Live matches first, then recent results (sorted), then upcoming
        return [
            ...liveMatches,
            ...allRecent.slice(0, 8), // Take top 8 most recent
            ...eplNext,
            ...laLigaNext,
            ...uclNext
        ];
    } catch {
        return [];
    }
}

export default async function ScoresTicker() {
    const matches = await getTickerData();

    if (matches.length === 0) return null;

    return (
        <div style={{ backgroundColor: "#f2f5f6", borderBottom: "1px solid #ddd", overflow: "hidden" }}>
            <div style={{ maxWidth: "132.48rem", margin: "0 auto" }}>
                <TickerScroll matches={matches} />
            </div>
            <style>{`@keyframes livePulse{0%,100%{box-shadow:0 0 0 0 rgba(233,23,61,.5)}50%{box-shadow:0 0 0 5px rgba(233,23,61,0)}}`}</style>
        </div>
    );
}
