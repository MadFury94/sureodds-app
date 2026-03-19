import { getRecentMatches, getUpcomingMatches, type MatchCard } from "@/lib/footballdata";
import TickerScroll from "./TickerScroll";

// Fetch recent + upcoming for the top 3 leagues in parallel
async function getTickerData(): Promise<MatchCard[]> {
    try {
        const [eplRecent, laLigaRecent, uclRecent, eplNext, laLigaNext, uclNext] = await Promise.all([
            getRecentMatches("PL", 4),
            getRecentMatches("PD", 4),
            getRecentMatches("CL", 4),
            getUpcomingMatches("PL", 3),
            getUpcomingMatches("PD", 3),
            getUpcomingMatches("CL", 3),
        ]);
        return [...eplRecent, ...laLigaRecent, ...uclRecent, ...eplNext, ...laLigaNext, ...uclNext];
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
