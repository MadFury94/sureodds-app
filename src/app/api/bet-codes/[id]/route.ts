import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const BET_CODES_FILE = path.join(process.cwd(), "src/data/bet-codes.json");

interface BetCode {
    id: string;
    bookmaker: string;
    code: string;
    link?: string;
    image?: string;
    description: string;
    odds: string;
    stake?: string;
    expiresAt: string;
    createdAt: string;
    status: "active" | "expired" | "won" | "lost";
    createdBy: string;
}

async function readBetCodes(): Promise<BetCode[]> {
    try {
        const raw = await fs.readFile(BET_CODES_FILE, "utf-8");
        return JSON.parse(raw) as BetCode[];
    } catch {
        return [];
    }
}

async function writeBetCodes(betCodes: BetCode[]): Promise<void> {
    await fs.writeFile(BET_CODES_FILE, JSON.stringify(betCodes, null, 2), "utf-8");
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const betCodes = await readBetCodes();
        const filtered = betCodes.filter(bc => bc.id !== id);

        if (filtered.length === betCodes.length) {
            return NextResponse.json({ error: "Bet code not found" }, { status: 404 });
        }

        await writeBetCodes(filtered);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting bet code:", error);
        return NextResponse.json({ error: "Failed to delete bet code" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        const betCodes = await readBetCodes();
        const index = betCodes.findIndex(bc => bc.id === id);

        if (index === -1) {
            return NextResponse.json({ error: "Bet code not found" }, { status: 404 });
        }

        betCodes[index] = { ...betCodes[index], status };
        await writeBetCodes(betCodes);

        return NextResponse.json({ betCode: betCodes[index] });
    } catch (error) {
        console.error("Error updating bet code:", error);
        return NextResponse.json({ error: "Failed to update bet code" }, { status: 500 });
    }
}
