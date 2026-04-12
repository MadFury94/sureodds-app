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

// GET - Fetch single betslip
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const betslips = readBetslips();
        const betslip = betslips.find((b: any) => b.id === parseInt(id));

        if (!betslip) {
            return NextResponse.json({ error: "Betslip not found" }, { status: 404 });
        }

        return NextResponse.json(betslip);
    } catch (error) {
        console.error("Error fetching betslip:", error);
        return NextResponse.json({ error: "Failed to fetch betslip" }, { status: 500 });
    }
}

// DELETE - Delete betslip
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const betslips = readBetslips();
        const filteredBetslips = betslips.filter((b: any) => b.id !== parseInt(id));

        if (betslips.length === filteredBetslips.length) {
            return NextResponse.json({ error: "Betslip not found" }, { status: 404 });
        }

        writeBetslips(filteredBetslips);
        return NextResponse.json({ success: true, message: "Betslip deleted" });
    } catch (error) {
        console.error("Error deleting betslip:", error);
        return NextResponse.json({ error: "Failed to delete betslip" }, { status: 500 });
    }
}

// PATCH - Update betslip scores
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const betslips = readBetslips();
        const betslipIndex = betslips.findIndex((b: any) => b.id === parseInt(id));

        if (betslipIndex === -1) {
            return NextResponse.json({ error: "Betslip not found" }, { status: 404 });
        }

        // Update selections with scores
        if (body.selections) {
            betslips[betslipIndex].selections = body.selections;
        }

        // Update status if provided
        if (body.status) {
            betslips[betslipIndex].status = body.status;
        }

        writeBetslips(betslips);
        return NextResponse.json({
            success: true,
            betslip: betslips[betslipIndex],
            message: "Betslip updated"
        });
    } catch (error) {
        console.error("Error updating betslip:", error);
        return NextResponse.json({ error: "Failed to update betslip" }, { status: 500 });
    }
}

// PUT - Edit betslip (confidence and selections)
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const betslips = readBetslips();
        const betslipIndex = betslips.findIndex((b: any) => b.id === parseInt(id));

        if (betslipIndex === -1) {
            return NextResponse.json({ error: "Betslip not found" }, { status: 404 });
        }

        // Update betslip
        const updated = {
            ...betslips[betslipIndex],
            selections: body.selections || betslips[betslipIndex].selections,
            confidence: body.confidence || betslips[betslipIndex].confidence,
            isAccumulator: (body.selections || betslips[betslipIndex].selections).length > 1,
            totalOdds: (body.selections || betslips[betslipIndex].selections)
                .reduce((acc: number, sel: any) => acc * parseFloat(sel.odds || "1"), 1)
                .toFixed(2),
        };

        betslips[betslipIndex] = updated;
        writeBetslips(betslips);

        return NextResponse.json({ success: true, betslip: updated });
    } catch (error) {
        console.error("Error editing betslip:", error);
        return NextResponse.json({ error: "Failed to edit betslip" }, { status: 500 });
    }
}
