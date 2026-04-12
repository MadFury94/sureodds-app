import { NextResponse } from "next/server";
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

function determineSelectionResult(selection: any): "won" | "lost" | "pending" {
    const { homeScore, awayScore, outcome } = selection;

    // If scores are not set, it's still pending
    if (homeScore === null || awayScore === null) {
        return "pending";
    }

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    switch (outcome) {
        case "Home Win":
            return home > away ? "won" : "lost";
        case "Away Win":
            return away > home ? "won" : "lost";
        case "Draw":
            return home === away ? "won" : "lost";
        case "Over 2.5 Goals":
            return (home + away) > 2.5 ? "won" : "lost";
        case "Under 2.5 Goals":
            return (home + away) < 2.5 ? "won" : "lost";
        case "Over 1.5 Goals":
            return (home + away) > 1.5 ? "won" : "lost";
        case "Under 1.5 Goals":
            return (home + away) < 1.5 ? "won" : "lost";
        case "BTTS Yes":
            return (home > 0 && away > 0) ? "won" : "lost";
        case "BTTS No":
            return (home === 0 || away === 0) ? "won" : "lost";
        case "Double Chance (1X)":
            return (home >= away) ? "won" : "lost";
        case "Double Chance (X2)":
            return (away >= home) ? "won" : "lost";
        case "Double Chance (12)":
            return (home !== away) ? "won" : "lost";
        default:
            return "pending";
    }
}

// POST - Check and update betslip results
export async function POST() {
    try {
        const betslips = readBetslips();
        let updatedCount = 0;

        betslips.forEach((betslip: any) => {
            // Skip if already determined
            if (betslip.status !== "pending") return;

            // Check each selection
            betslip.selections.forEach((selection: any) => {
                const result = determineSelectionResult(selection);
                if (selection.status !== result) {
                    selection.status = result;
                    updatedCount++;
                }
            });

            // Determine overall betslip status
            // For accumulator: ALL selections must win for betslip to win
            // If ANY selection loses, the entire betslip loses
            const hasLost = betslip.selections.some((s: any) => s.status === "lost");
            const allWon = betslip.selections.every((s: any) => s.status === "won");
            const hasPending = betslip.selections.some((s: any) => s.status === "pending");

            if (hasLost) {
                betslip.status = "lost";
            } else if (allWon) {
                betslip.status = "won";
            } else if (hasPending) {
                betslip.status = "pending";
            }
        });

        writeBetslips(betslips);

        return NextResponse.json({
            success: true,
            message: `Checked ${betslips.length} betslips, updated ${updatedCount} selections`,
            betslips,
        });
    } catch (error) {
        console.error("Error checking results:", error);
        return NextResponse.json({ error: "Failed to check results" }, { status: 500 });
    }
}
