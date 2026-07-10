import { getRecentMatches, getUpcomingMatches, getLiveMatches, getWorldCupMatches, type MatchCard } from "@/lib/footballdata";
import TickerScroll from "./TickerScroll";

// Fetch live matches first, then recent results (sorted by date), then upcoming matches
async function getTickerData(): Promise<MatchCard[]> {
    try {
        const [liveMatches, worldCupMatches, eplRecent, laLigaRecent, uclRecent, eplNext, laLigaNext, uclNext] = await Promise.all([
            getLiveMatches(),
            getWorldCupMatches(6),
            getRecentMatches("PL", 4),
            getRecentMatches("PD", 4),
            getRecentMatches("CL", 4),
            getUpcomingMatches("PL", 2),
            getUpcomingMatches("PD", 2),
            getUpcomingMatches("CL", 2),
        ]);

        // Combine and sort recent league matches by date (most recent first)
        const allRecent = [...eplRecent, ...laLigaRecent, ...uclRecent];
        allRecent.sort((a, b) =>
            new Date(b.utcDate || 0).getTime() - new Date(a.utcDate || 0).getTime()
        );

        // World Cup takes priority after live matches
        const combined = [
            ...liveMatches,
            ...worldCupMatches,
            ...allRecent.slice(0, 6),
            ...eplNext,
            ...laLigaNext,
            ...uclNext,
        ];

        // Deduplicate by id
        const seen = new Set<number>();
        return combined.filter(m => seen.has(m.id) ? false : (seen.add(m.id), true));
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
