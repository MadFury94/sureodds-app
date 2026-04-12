import { NextRequest, NextResponse } from "next/server";

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// GET /api/sports/odds-matches?sportKey=soccer_epl
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sportKey = searchParams.get("sportKey");

        if (!sportKey) {
            return NextResponse.json(
                { error: "sportKey is required" },
                { status: 400 }
            );
        }

        if (!ODDS_API_KEY || ODDS_API_KEY === "your_odds_api_key_here") {
            return NextResponse.json({
                error: "ODDS_API_KEY not configured",
                message: "Configure ODDS_API_KEY in .env.local",
            }, { status: 400 });
        }

        // Fetch all available markets
        const oddsUrl = `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=uk,us,eu&markets=h2h,spreads,totals,btts,h2h_lay&oddsFormat=decimal`;

        const fetchResult = await fetch(oddsUrl, {
            headers: { "Accept": "application/json" },
        });

        if (!fetchResult.ok) {
            throw new Error(`Odds API error: ${fetchResult.statusText}`);
        }

        const matches = await fetchResult.json();

        // Transform matches to include all available markets
        const transformedMatches = matches.map((match: any) => {
            const markets: Record<string, any> = {};
            const availableMarkets: string[] = [];

            // Process all bookmakers and markets
            match.bookmakers?.forEach((bookmaker: any) => {
                bookmaker.markets?.forEach((market: any) => {
                    if (!markets[market.key]) {
                        markets[market.key] = [];
                    }

                    market.outcomes?.forEach((outcome: any) => {
                        const existing = markets[market.key].find((m: any) =>
                            m.name === outcome.name && m.point === outcome.point
                        );

                        if (existing) {
                            existing.prices.push(outcome.price);
                        } else {
                            markets[market.key].push({
                                name: outcome.name,
                                point: outcome.point,
                                prices: [outcome.price],
                            });
                        }
                    });

                    if (!availableMarkets.includes(market.key)) {
                        availableMarkets.push(market.key);
                    }
                });
            });

            // Calculate average odds for each market
            Object.keys(markets).forEach(marketKey => {
                markets[marketKey] = markets[marketKey].map((outcome: any) => ({
                    ...outcome,
                    avgOdds: (outcome.prices.reduce((a: number, b: number) => a + b, 0) / outcome.prices.length).toFixed(2),
                    bookmakerCount: outcome.prices.length,
                }));
            });

            return {
                id: match.id,
                sportKey: match.sport_key,
                sportTitle: match.sport_title,
                commenceTime: match.commence_time,
                homeTeam: match.home_team,
                awayTeam: match.away_team,
                markets,
                availableMarkets,
                bookmakerCount: match.bookmakers?.length || 0,
            };
        });

        return NextResponse.json({
            matches: transformedMatches,
            total: transformedMatches.length,
        });

    } catch (error) {
        console.error("Error fetching matches:", error);
        return NextResponse.json({
            error: "Failed to fetch matches",
            message: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
