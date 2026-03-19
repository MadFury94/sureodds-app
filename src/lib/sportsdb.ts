const KEY = process.env.SPORTSDB_API_KEY ?? "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

export interface SportsDBLeague {
    idLeague: string;
    strLeague: string;
    strBadge: string | null;   // competition badge/crest PNG
    strLogo: string | null;    // wordmark/logo PNG
    strFanart1: string | null; // background fanart
    strFanart2: string | null;
    strFanart3: string | null;
    strFanart4: string | null;
    strBanner: string | null;
    strPoster: string | null;
    strTrophy: string | null;
}

// Known league IDs on TheSportsDB
export const LEAGUE_IDS: Record<string, string> = {
    epl: "4328",
    "la-liga": "4335",
    ucl: "4346",
    afcon: "4480",
    "international-football": "4399",
};

export async function getLeagueData(leagueId: string): Promise<SportsDBLeague | null> {
    try {
        const res = await fetch(
            `${BASE}/lookupleague.php?id=${leagueId}`,
            { next: { revalidate: 86400 } } // cache 24h
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data?.leagues?.[0] ?? null;
    } catch {
        return null;
    }
}
