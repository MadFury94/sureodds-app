import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { readUsers } from "@/lib/auth";

const TIPS_FILE = path.join(process.cwd(), "src/data/tips.json");
const BET_CODES_FILE = path.join(process.cwd(), "src/data/bet-codes.json");

function readTips() {
    try {
        return JSON.parse(readFileSync(TIPS_FILE, "utf-8"));
    } catch {
        return [];
    }
}

function readBetCodes() {
    try {
        return JSON.parse(readFileSync(BET_CODES_FILE, "utf-8"));
    } catch {
        return [];
    }
}

function isAdminAuthed(req: NextRequest): boolean {
    const adminRaw = req.cookies.get("so_admin_session")?.value;
    if (adminRaw) {
        try {
            return !!JSON.parse(adminRaw)?.token;
        } catch {
            return false;
        }
    }
    return false;
}

export async function GET(req: NextRequest) {
    if (!isAdminAuthed(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await readUsers();
        const tips = readTips();
        const betCodes = readBetCodes();

        // Get all punters
        const punters = users.filter(u => u.role === "punter" && u.status === "active");

        // Calculate stats for each punter
        const stats = punters.map(punter => {
            // Get tips created by this punter
            const punterTips = tips.filter((tip: any) =>
                tip.createdBy?.id === punter.id || tip.createdBy?.email === punter.email
            );

            const totalPredictions = punterTips.length;
            const won = punterTips.filter((t: any) => t.result === "won").length;
            const lost = punterTips.filter((t: any) => t.result === "lost").length;
            const pending = punterTips.filter((t: any) => t.result === "pending").length;

            const winRate = totalPredictions > 0 && (won + lost) > 0
                ? Math.round((won / (won + lost)) * 100)
                : 0;

            // Get bet codes shared by this punter
            const punterBetCodes = betCodes.filter((code: any) =>
                code.createdBy === punter.name || code.createdBy === punter.email
            );

            return {
                id: punter.id,
                name: punter.name,
                email: punter.email,
                totalPredictions,
                won,
                lost,
                pending,
                winRate,
                totalBetCodes: punterBetCodes.length,
            };
        });

        // Sort by total predictions (most active first)
        stats.sort((a, b) => b.totalPredictions - a.totalPredictions);

        return NextResponse.json({ stats });
    } catch (error) {
        console.error("Punter stats error:", error);
        return NextResponse.json({ error: "Failed to get punter stats" }, { status: 500 });
    }
}
