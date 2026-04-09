const BASE = "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY ?? "";

// Map category slugs → football-data.org competition codes
export const FD_LEAGUE_CODES: Record<string, string> = {
    epl: "PL",
    "la-liga": "PD",
    ucl: "CL",
    "serie-a": "SA",
};

// Competitions that have league-format standings
export const HAS_STANDINGS = new Set(["PL", "PD", "SA"]);

async function fdFetch<T>(path: string, revalidate = 300): Promise<T | null> {
    if (!KEY) {
        console.warn("Football-Data API key missing");
        return null;
    }
    try {
        const res = await fetch(`${BASE}${path}`, {
            headers: { "X-Auth-Token": KEY },
            next: { revalidate },
        });
        if (!res.ok) {
            console.warn(`Football-Data API error: ${res.status} ${res.statusText} for ${path}`);
            return null;
        }
        return res.json() as Promise<T>;
    } catch (err) {
        console.warn("Football-Data fetch failed:", err);
        return null;
    }
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface FDTeam {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

export interface FDScore {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
}

export interface FDMatch {
    id: number;
    utcDate: string;
    status: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "SUSPENDED" | "POSTPONED" | "CANCELLED";
    matchday: number | null;
    homeTeam: FDTeam;
    awayTeam: FDTeam;
    score: FDScore;
    competition: { name: string; code: string; emblem: string };
    venue?: string;
}

export interface FDStandingRow {
    position: number;
    team: FDTeam;
    playedGames: number;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalDifference: number;
    goalsFor: number;
    goalsAgainst: number;
    form: string | null;
}

// Normalised shapes passed to components
export interface MatchCard {
    id: number;
    home: string;
    homeCrest: string;
    away: string;
    awayCrest: string;
    homeScore: number | null;
    awayScore: number | null;
    date: string;       // "Mar 22"
    time: string;       // "17:30" or "FT"
    competition: string;
    status: "FT" | "LIVE" | "NS" | "PP";
    venue?: string;
    utcDate: string;    // ISO date string for sorting
}

export interface StandingRow {
    pos: number;
    team: string;
    crest: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gd: number;
    pts: number;
    form: string | null;
}

export interface TopScorer {
    player: { name: string; id: number };
    team: { name: string; shortName: string; crest: string };
    goals: number;
    assists: number | null;
    penalties: number | null;
}

export interface MatchDetailPlayer {
    id: number;
    name: string;
    position: string;
    shirtNumber: number;
}

export interface MatchGoal {
    minute: number;
    extraTime: number | null;
    type: "REGULAR" | "OWN_GOAL" | "PENALTY";
    team: { id: number; name: string };
    scorer: { id: number; name: string };
    assist: { id: number; name: string } | null;
}

export interface MatchBooking {
    minute: number;
    team: { id: number; name: string };
    player: { id: number; name: string };
    card: "YELLOW_CARD" | "RED_CARD";
}

export interface MatchSubstitution {
    minute: number;
    team: { id: number; name: string };
    playerOut: { id: number; name: string };
    playerIn: { id: number; name: string };
}

export interface MatchDetails {
    match: FDMatch & {
        homeTeam: FDTeam & {
            lineup?: MatchDetailPlayer[];
            bench?: MatchDetailPlayer[];
            coach?: { name: string };
        };
        awayTeam: FDTeam & {
            lineup?: MatchDetailPlayer[];
            bench?: MatchDetailPlayer[];
            coach?: { name: string };
        };
        goals?: MatchGoal[];
        bookings?: MatchBooking[];
        substitutions?: MatchSubstitution[];
        referees?: Array<{ name: string }>;
    };
    head2head?: {
        numberOfMatches: number;
        homeTeam: { wins: number; draws: number; losses: number };
        awayTeam: { wins: number; draws: number; losses: number };
    };
}

export interface TeamSquadPlayer {
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
}

export interface TeamDetails {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    address: string;
    website: string;
    founded: number;
    clubColors: string;
    venue: string;
    squad: TeamSquadPlayer[];
    coach?: { name: string; nationality: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtDate(utc: string): string {
    return new Date(utc).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtTime(utc: string): string {
    return new Date(utc).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
    });
}

function normaliseMatch(m: FDMatch): MatchCard {
    const finished = m.status === "FINISHED";
    const live = m.status === "IN_PLAY" || m.status === "PAUSED";
    const postponed = m.status === "POSTPONED" || m.status === "CANCELLED" || m.status === "SUSPENDED";
    return {
        id: m.id,
        home: m.homeTeam.shortName || m.homeTeam.name,
        homeCrest: m.homeTeam.crest,
        away: m.awayTeam.shortName || m.awayTeam.name,
        awayCrest: m.awayTeam.crest,
        homeScore: finished || live ? m.score.fullTime.home : null,
        awayScore: finished || live ? m.score.fullTime.away : null,
        date: fmtDate(m.utcDate),
        time: finished ? "FT" : postponed ? "PP" : fmtTime(m.utcDate),
        competition: m.competition.name,
        status: finished ? "FT" : live ? "LIVE" : postponed ? "PP" : "NS",
        venue: m.venue,
        utcDate: m.utcDate,
    };
}

// ── Fetchers ──────────────────────────────────────────────────────────────

/** Last N finished matches for a competition */
export async function getRecentMatches(code: string, limit = 8): Promise<MatchCard[]> {
    const data = await fdFetch<{ matches: FDMatch[] }>(
        `/competitions/${code}/matches?status=FINISHED`,
        300
    );
    if (!data?.matches?.length) return [];
    return data.matches.slice(-limit).reverse().map(normaliseMatch);
}

/** Next N scheduled matches for a competition */
export async function getUpcomingMatches(code: string, limit = 6): Promise<MatchCard[]> {
    const data = await fdFetch<{ matches: FDMatch[] }>(
        `/competitions/${code}/matches?status=SCHEDULED,TIMED`,
        300
    );
    if (!data?.matches?.length) return [];
    return data.matches.slice(0, limit).map(normaliseMatch);
}

/** League table (top 10) */
export async function getStandings(code: string): Promise<StandingRow[]> {
    if (!HAS_STANDINGS.has(code)) return [];
    const data = await fdFetch<{
        standings: Array<{ type: string; table: FDStandingRow[] }>;
    }>(`/competitions/${code}/standings`, 600);
    if (!data?.standings) return [];
    const total = data.standings.find(s => s.type === "TOTAL");
    if (!total) return [];
    return total.table.slice(0, 10).map(r => ({
        pos: r.position,
        team: r.team.shortName || r.team.name,
        crest: r.team.crest,
        played: r.playedGames,
        won: r.won,
        drawn: r.draw,
        lost: r.lost,
        gd: r.goalDifference,
        pts: r.points,
        form: r.form ?? null,
    }));
}

/** Fetch all three in parallel for a league category */
export async function getLeaguePageData(code: string) {
    const [recent, upcoming, standings] = await Promise.all([
        getRecentMatches(code),
        getUpcomingMatches(code),
        getStandings(code),
    ]);
    return { recent, upcoming, standings };
}

/** Fetch just the competition emblem URL */
export async function getCompetitionEmblem(code: string): Promise<string | null> {
    const data = await fdFetch<{ emblem: string }>(`/competitions/${code}`, 86400);
    return data?.emblem ?? null;
}

/** Get top scorers for a competition */
export async function getTopScorers(code: string, limit = 10): Promise<TopScorer[]> {
    const data = await fdFetch<{ scorers: TopScorer[] }>(
        `/competitions/${code}/scorers`,
        600
    );
    if (!data?.scorers?.length) return [];
    return data.scorers.slice(0, limit);
}

/** Get live matches across all competitions */
export async function getLiveMatches(): Promise<MatchCard[]> {
    const data = await fdFetch<{ matches: FDMatch[] }>(
        `/matches?status=IN_PLAY`,
        60 // Revalidate every minute for live data
    );
    if (!data?.matches?.length) return [];
    return data.matches.map(normaliseMatch);
}

/** Get detailed match information including lineups, goals, cards, subs */
export async function getMatchDetails(matchId: number): Promise<MatchDetails | null> {
    const data = await fdFetch<MatchDetails>(`/matches/${matchId}`, 300);
    return data;
}

/** Get team details including squad */
export async function getTeamDetails(teamId: number): Promise<TeamDetails | null> {
    const data = await fdFetch<TeamDetails>(`/teams/${teamId}`, 86400);
    return data;
}

/** Fetch all league data including top scorers */
export async function getLeaguePageDataWithScorers(code: string) {
    const [recent, upcoming, standings, topScorers] = await Promise.all([
        getRecentMatches(code),
        getUpcomingMatches(code),
        getStandings(code),
        getTopScorers(code, 10),
    ]);
    return { recent, upcoming, standings, topScorers };
}
