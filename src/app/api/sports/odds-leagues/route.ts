import { NextRequest, NextResponse } from "next/server";

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// GET /api/sports/odds-leagues - Fetch all available sports/leagues from The Odds API
export async function GET(req: NextRequest) {
    try {
        if (!ODDS_API_KEY || ODDS_API_KEY === "your_odds_api_key_here") {
            return NextResponse.json({
                error: "ODDS_API_KEY not configured",
                message: "Configure ODDS_API_KEY in .env.local to fetch leagues",
            }, { status: 400 });
        }

        const sportsUrl = `${ODDS_API_BASE}/sports/?apiKey=${ODDS_API_KEY}`;

        const fetchResult = await fetch(sportsUrl, {
            headers: { "Accept": "application/json" },
        });

        if (!fetchResult.ok) {
            throw new Error(`Odds API error: ${fetchResult.statusText}`);
        }

        const allSports = await fetchResult.json();

        // Filter for only soccer/football leagues that are active
        const footballLeagues = allSports.filter((sport: any) =>
            sport.group === "Soccer" && sport.active === true
        );

        return NextResponse.json({
            leagues: footballLeagues,
            total: footballLeagues.length,
        });

    } catch (error) {
        console.error("Error fetching leagues:", error);
        return NextResponse.json({
            error: "Failed to fetch leagues",
            message: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
