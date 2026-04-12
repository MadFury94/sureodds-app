import { NextRequest, NextResponse } from "next/server";

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

const TEAM_NAME_MAPPING: Record<string, string> = {
    "Manchester United": "Manchester United",
    "Manchester City": "Manchester City",
    "Liverpool": "Liverpool",
    "Chelsea": "Chelsea",
    "Arsenal": "Arsenal",
    "Tottenham": "Tottenham Hotspur",
    "Newcastle": "Newcastle United",
    "Brighton": "Brighton and Hove Albion",
    "Aston Villa": "Aston Villa",
    "Brentford": "Brentford",
    "Crystal Palace": "Crystal Palace",
    "Fulham": "Fulham",
    "Leeds United": "Leeds United",
    "Leicester": "Leicester City",
    "Nottingham": "Nottingham Forest",
    "Southampton": "Southampton",
    "West Ham": "West Ham United",
    "Wolves": "Wolverhampton Wanderers",
    "Everton": "Everton",
    "Bournemouth": "AFC Bournemouth",
};

function normalizeTeamName(name: string): string {
    return TEAM_NAME_MAPPING[name] || name;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const homeTeam = searchParams.get("homeTeam");
        const awayTeam = searchParams.get("awayTeam");
        const league = searchParams.get("league");

        if (!homeTeam || !awayTeam) {
            return NextResponse.json(
                { error: "homeTeam and awayTeam are required" },
                { status: 400 }
            );
        }

        if (!ODDS_API_KEY || ODDS_API_KEY === "your_odds_api_key_here") {
            return NextResponse.json({
                estimated: true,
                homeWin: "2.10",
                draw: "3.40",
                awayWin: "3.20",
                over15: "1.30",
                under15: "3.50",
                over25: "1.85",
                under25: "1.95",
                over35: "2.50",
                under35: "1.55",
                bttsYes: "1.80",
                bttsNo: "2.00",
                availableMarkets: ["Home Win", "Draw", "Away Win", "Over 1.5 Goals", "Under 1.5 Goals", "Over 2.5 Goals", "Under 2.5 Goals", "Over 3.5 Goals", "Under 3.5 Goals", "Both Teams To Score", "Both Teams Not To Score"],
                message: "Using estimated odds. Configure ODDS_API_KEY for live odds.",
            });
        }

        let sportKey = "soccer_epl";

        if (league?.includes("Champions League")) {
            sportKey = "soccer_uefa_champs_league";
        } else if (league?.includes("La Liga")) {
            sportKey = "soccer_spain_la_liga";
        } else if (league?.includes("Serie A")) {
            sportKey = "soccer_italy_serie_a";
        } else if (league?.includes("Bundesliga")) {
            sportKey = "soccer_germany_bundesliga";
        } else if (league?.includes("Ligue 1")) {
            sportKey = "soccer_france_ligue_one";
        }

        const oddsUrl = `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=uk&markets=h2h,spreads,totals,btts,h2h_lay,outrights&oddsFormat=decimal`;

        const fetchResult = await fetch(oddsUrl, {
            headers: { "Accept": "application/json" },
        });

        if (!fetchResult.ok) {
            throw new Error(`Odds API error: ${fetchResult.statusText}`);
        }

        const data = await fetchResult.json();

        const normalizedHome = normalizeTeamName(homeTeam);
        const normalizedAway = normalizeTeamName(awayTeam);

        const match = data.find((event: any) => {
            const eventHome = event.home_team;
            const eventAway = event.away_team;
            return (
                (eventHome.includes(normalizedHome) || normalizedHome.includes(eventHome)) &&
                (eventAway.includes(normalizedAway) || normalizedAway.includes(eventAway))
            );
        });

        if (!match) {
            return NextResponse.json({
                estimated: true,
                homeWin: "2.10",
                draw: "3.40",
                awayWin: "3.20",
                over15: "1.30",
                under15: "3.50",
                over25: "1.85",
                under25: "1.95",
                over35: "2.50",
                under35: "1.55",
                bttsYes: "1.80",
                bttsNo: "2.00",
                availableMarkets: ["Home Win", "Draw", "Away Win", "Over 1.5 Goals", "Under 1.5 Goals", "Over 2.5 Goals", "Under 2.5 Goals", "Over 3.5 Goals", "Under 3.5 Goals", "Both Teams To Score", "Both Teams Not To Score"],
                message: "Match not found in odds API. Using estimated odds.",
            });
        }

        const bookmakers = match.bookmakers || [];

        // Store all odds by market type dynamically
        const oddsData: Record<string, any> = {};
        const availableMarkets: string[] = [];

        bookmakers.forEach((bookmaker: any) => {
            bookmaker.markets.forEach((market: any) => {
                const marketKey = market.key;

                // Initialize market if not exists
                if (!oddsData[marketKey]) {
                    oddsData[marketKey] = {};
                }

                // Process outcomes based on market type
                market.outcomes.forEach((outcome: any) => {
                    const outcomeName = outcome.name;
                    const point = outcome.point; // For totals and spreads

                    // Create unique key for outcome
                    let outcomeKey = outcomeName;
                    if (point !== undefined) {
                        outcomeKey = `${outcomeName}_${point}`;
                    }

                    if (!oddsData[marketKey][outcomeKey]) {
                        oddsData[marketKey][outcomeKey] = [];
                    }

                    oddsData[marketKey][outcomeKey].push(outcome.price);
                });
            });
        });

        const avg = (arr: number[]) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;

        const result: any = {
            estimated: false,
            bookmakerCount: bookmakers.length,
            lastUpdate: match.commence_time,
            availableMarkets: [] as string[],
            markets: {} as Record<string, any>,
        };

        // Process h2h (1X2) market
        if (oddsData.h2h) {
            const homeTeamName = match.home_team;
            const awayTeamName = match.away_team;

            if (oddsData.h2h[homeTeamName]?.length > 0) {
                result.homeWin = avg(oddsData.h2h[homeTeamName]);
                result.availableMarkets.push("Home Win");
            }
            if (oddsData.h2h["Draw"]?.length > 0) {
                result.draw = avg(oddsData.h2h["Draw"]);
                result.availableMarkets.push("Draw");
            }
            if (oddsData.h2h[awayTeamName]?.length > 0) {
                result.awayWin = avg(oddsData.h2h[awayTeamName]);
                result.availableMarkets.push("Away Win");
            }
        }

        // Process totals market (Over/Under)
        if (oddsData.totals) {
            Object.keys(oddsData.totals).forEach(key => {
                if (key.startsWith("Over_")) {
                    const point = key.split("_")[1];
                    const odds = avg(oddsData.totals[key]);
                    if (odds) {
                        result[`over${point.replace(".", "")}`] = odds;
                        result.availableMarkets.push(`Over ${point} Goals`);
                    }
                }
                if (key.startsWith("Under_")) {
                    const point = key.split("_")[1];
                    const odds = avg(oddsData.totals[key]);
                    if (odds) {
                        result[`under${point.replace(".", "")}`] = odds;
                        result.availableMarkets.push(`Under ${point} Goals`);
                    }
                }
            });
        }

        // Process BTTS market
        if (oddsData.btts) {
            if (oddsData.btts["Yes"]?.length > 0) {
                result.bttsYes = avg(oddsData.btts["Yes"]);
                result.availableMarkets.push("Both Teams To Score");
            }
            if (oddsData.btts["No"]?.length > 0) {
                result.bttsNo = avg(oddsData.btts["No"]);
                result.availableMarkets.push("Both Teams Not To Score");
            }
        }

        // Process spreads/handicap market
        if (oddsData.spreads) {
            Object.keys(oddsData.spreads).forEach(key => {
                const odds = avg(oddsData.spreads[key]);
                if (odds) {
                    const parts = key.split("_");
                    const team = parts[0];
                    const handicap = parts[1];
                    const marketName = `${team} ${handicap > 0 ? '+' : ''}${handicap}`;
                    result.markets[`spread_${key}`] = odds;
                    result.availableMarkets.push(marketName);
                }
            });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error fetching odds:", error);
        return NextResponse.json({
            estimated: true,
            homeWin: "2.10",
            draw: "3.40",
            awayWin: "3.20",
            over15: "1.30",
            under15: "3.50",
            over25: "1.85",
            under25: "1.95",
            over35: "2.50",
            under35: "1.55",
            bttsYes: "1.80",
            bttsNo: "2.00",
            availableMarkets: ["Home Win", "Draw", "Away Win", "Over 1.5 Goals", "Under 1.5 Goals", "Over 2.5 Goals", "Under 2.5 Goals", "Over 3.5 Goals", "Under 3.5 Goals", "Both Teams To Score", "Both Teams Not To Score"],
            message: "Error fetching live odds. Using estimated odds.",
        });
    }
}
