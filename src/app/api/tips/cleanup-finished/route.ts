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

function isMatchFinished(matchDate: string): boolean {
    try {
        const matchTime = new Date(matchDate);
        const now = new Date();

        // Consider match finished if it's more than 2 hours past the scheduled time
        const twoHoursAfterMatch = new Date(matchTime.getTime() + (2 * 60 * 60 * 1000));

        return now > twoHoursAfterMatch;
    } catch {
        return false;
    }
}

// Remove finished games from betting tips page
export async function POST(req: NextRequest) {
    if (!(await isAuthorized(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tips = readTips();

        // Filter out finished games that have been decided (won/lost)
        const activeTips = tips.filter((tip: any) => {
            // Keep pending tips
            if (tip.result === "pending") {
                // But remove if match date has passed by more than 2 hours
                if (tip.matchDate && isMatchFinished(tip.matchDate)) {
                    return false;
                }
                return true;
            }

            // Keep won/lost tips for history (admin can manually delete later)
            return true;
        });

        const removedCount = tips.length - activeTips.length;

        if (removedCount > 0) {
            writeTips(activeTips);
        }

        return NextResponse.json({
            success: true,
            removedCount,
            message: `${removedCount} finished game(s) removed from betting tips`,
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: "Failed to cleanup finished games" }, { status: 500 });
    }
}

// Get stats about finished games
export async function GET() {
    try {
        const tips = readTips();

        const finishedGames = tips.filter((tip: any) =>
            tip.matchDate && isMatchFinished(tip.matchDate) && tip.result === "pending"
        );

        return NextResponse.json({
            finishedGamesCount: finishedGames.length,
            finishedGames: finishedGames.map((tip: any) => ({
                id: tip.id,
                match: `${tip.home} vs ${tip.away}`,
                matchDate: tip.matchDate,
            })),
        });
    } catch (error) {
        console.error("Get finished games error:", error);
        return NextResponse.json({ error: "Failed to get finished games" }, { status: 500 });
    }
}
