import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BETSLIPS_FILE = path.join(process.cwd(), "src/data/betslips.json");

function readBetslips() {
    try {
        const data = fs.readFileSync(BETSLIPS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeBetslips(betslips: any[]) {
    fs.writeFileSync(BETSLIPS_FILE, JSON.stringify(betslips, null, 2));
}

// GET - Fetch all betslips
export async function GET() {
    try {
        const betslips = readBetslips();
        return NextResponse.json(betslips);
    } catch (error) {
        console.error("Error reading betslips:", error);
        return NextResponse.json({ error: "Failed to fetch betslips" }, { status: 500 });
    }
}

// POST - Create new betslip
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { selections, confidence, createdBy } = body;

        if (!selections || !Array.isArray(selections) || selections.length === 0) {
            return NextResponse.json({ error: "Selections are required" }, { status: 400 });
        }

        const betslips = readBetslips();
        const newId = betslips.length > 0 ? Math.max(...betslips.map((b: any) => b.id)) + 1 : 1;

        // Calculate total odds by multiplying all individual odds
        const totalOdds = selections.reduce((acc, sel) => {
            const odds = parseFloat(sel.odds) || 1;
            return acc * odds;
        }, 1);

        const newBetslip = {
            id: newId,
            selections: selections.map((sel: any, index: number) => ({
                id: `${newId}-${index}`,
                league: sel.league,
                home: sel.home,
                away: sel.away,
                outcome: sel.outcome,
                odds: sel.odds,
                matchDate: sel.matchDate,
                homeScore: null,
                awayScore: null,
                status: "pending", // pending, won, lost
            })),
            totalOdds: totalOdds.toFixed(2),
            confidence: confidence || "High",
            isAccumulator: selections.length > 1,
            status: "pending", // pending, won, lost
            createdBy: createdBy || null,
            createdAt: new Date().toISOString(),
            time: "Just now",
        };

        betslips.push(newBetslip);
        writeBetslips(betslips);

        return NextResponse.json({
            success: true,
            betslip: newBetslip,
            message: "Betslip created successfully"
        });
    } catch (error) {
        console.error("Error creating betslip:", error);
        return NextResponse.json({ error: "Failed to create betslip" }, { status: 500 });
    }
}
