import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const TIPS_FILE = path.join(process.cwd(), "src/data/tips.json");

function readTips() {
    try {
        return JSON.parse(readFileSync(TIPS_FILE, "utf-8"));
    } catch {
        return [];
    }
}

function writeTips(tips: unknown[]) {
    writeFileSync(TIPS_FILE, JSON.stringify(tips, null, 2));
}

async function isAuthorized(req: NextRequest): Promise<boolean> {
    const adminRaw = req.cookies.get("so_admin_session")?.value;
    if (adminRaw) {
        try { if (JSON.parse(adminRaw)?.token) return true; } catch { /* */ }
    }
    return false;
}

interface Match {
    id: number;
    homeTeam: { name: string };
    awayTeam: { name: string };
    score: {
        fullTime: { home: number | null; away: number | null };
    };
    status: string;
}

async function fetchMatchResult(homeTeam: string, awayTeam: string): Promise<{ won: boolean; lost: boolean } | null> {
    try {
        // Use Football Data API to get match results
        const apiKey = process.env.FOOTBALL_DATA_API_KEY;
        if (!apiKey) return null;

        // Search for the match in recent fixtures
        const response = await fetch(
            `https://api.football-data.org/v4/matches?status=FINISHED`,
            {
                headers: { "X-Auth-Token": apiKey },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const matches: Match[] = data.matches || [];

        // Find the match
        const match = matches.find((m: Match) =>
            (m.homeTeam.name.toLowerCase().includes(homeTeam.toLowerCase()) ||
                homeTeam.toLowerCase().includes(m.homeTeam.name.toLowerCase())) &&
            (m.awayTeam.name.toLowerCase().includes(awayTeam.toLowerCase()) ||
                awayTeam.toLowerCase().includes(m.awayTeam.name.toLowerCase()))
        );

        if (!match || !match.score.fullTime.home || !match.score.fullTime.away) {
            return null;
        }

        return {
            won: false, // Will be determined by prediction type
            lost: false,
        };
    } catch (error) {
        console.error("Error fetching match result:", error);
        return null;
    }
}

function checkPredictionResult(
    outcome: string,
    homeScore: number,
    awayScore: number
): "won" | "lost" {
    const normalizedOutcome = outcome.toLowerCase();

    // Home Win
    if (normalizedOutcome.includes("home win") || normalizedOutcome === "1") {
        return homeScore > awayScore ? "won" : "lost";
    }

    // Away Win
    if (normalizedOutcome.includes("away win") || normalizedOutcome === "2") {
        return awayScore > homeScore ? "won" : "lost";
    }

    // Draw
    if (normalizedOutcome.includes("draw") || normalizedOutcome === "x") {
        return homeScore === awayScore ? "won" : "lost";
    }

    // Over/Under Goals
    const totalGoals = homeScore + awayScore;
    if (normalizedOutcome.includes("over 2.5")) {
        return totalGoals > 2.5 ? "won" : "lost";
    }
    if (normalizedOutcome.includes("under 2.5")) {
        return totalGoals < 2.5 ? "won" : "lost";
    }
    if (normalizedOutcome.includes("over 1.5")) {
        return totalGoals > 1.5 ? "won" : "lost";
    }
    if (normalizedOutcome.includes("under 1.5")) {
        return totalGoals < 1.5 ? "won" : "lost";
    }
    if (normalizedOutcome.includes("over 3.5")) {
        return totalGoals > 3.5 ? "won" : "lost";
    }
    if (normalizedOutcome.includes("under 3.5")) {
        return totalGoals < 3.5 ? "won" : "lost";
    }

    // Both Teams To Score
    if (normalizedOutcome.includes("both teams to score") || normalizedOutcome.includes("btts yes")) {
        return homeScore > 0 && awayScore > 0 ? "won" : "lost";
    }
    if (normalizedOutcome.includes("both teams not to score") || normalizedOutcome.includes("btts no")) {
        return homeScore === 0 || awayScore === 0 ? "won" : "lost";
    }

    // Double Chance
    if (normalizedOutcome.includes("home or draw") || normalizedOutcome.includes("1x")) {
        return homeScore >= awayScore ? "won" : "lost";
    }
    if (normalizedOutcome.includes("away or draw") || normalizedOutcome.includes("x2")) {
        return awayScore >= homeScore ? "won" : "lost";
    }

    // Default: can't determine
    return "lost";
}

export async function POST(req: NextRequest) {
    if (!(await isAuthorized(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, homeScore, awayScore } = await req.json();

        if (!id || homeScore === undefined || awayScore === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const tips = readTips();
        const index = tips.findIndex((t: { id: number }) => t.id === parseInt(id.toString()));

        if (index === -1) {
            return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
        }

        const tip = tips[index];
        const result = checkPredictionResult(tip.outcome, homeScore, awayScore);

        tips[index] = { ...tip, result };
        writeTips(tips);

        return NextResponse.json({
            success: true,
            result,
            message: `Prediction marked as ${result}`
        });
    } catch (error) {
        console.error("Check result error:", error);
        return NextResponse.json({ error: "Failed to check result" }, { status: 500 });
    }
}

// Bulk check results
export async function PUT(req: NextRequest) {
    if (!(await isAuthorized(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tips = readTips();
        let updatedCount = 0;

        // This would ideally fetch from Football Data API
        // For now, admin can manually update results

        return NextResponse.json({
            success: true,
            updatedCount,
            message: `${updatedCount} prediction(s) updated`
        });
    } catch (error) {
        console.error("Bulk check error:", error);
        return NextResponse.json({ error: "Failed to check results" }, { status: 500 });
    }
}
