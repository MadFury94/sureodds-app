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
    createdBy: string; // User ID
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

export async function GET() {
    try {
        const betCodes = await readBetCodes();
        // Sort by created date, newest first
        betCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json({ betCodes });
    } catch (error) {
        console.error("Error reading bet codes:", error);
        return NextResponse.json({ error: "Failed to load bet codes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { bookmaker, code, link, image, description, odds, stake, expiresAt } = body;

        if (!bookmaker) {
            return NextResponse.json({ error: "Bookmaker is required" }, { status: 400 });
        }

        if (!code && !link && !image) {
            return NextResponse.json({ error: "At least one of code, link, or image is required" }, { status: 400 });
        }

        const betCodes = await readBetCodes();

        const newBetCode: BetCode = {
            id: Date.now().toString(),
            bookmaker,
            code: code || "",
            link: link || "",
            image: image || "",
            description: description || "",
            odds: odds || "",
            stake: stake || "",
            expiresAt: expiresAt || "",
            createdAt: new Date().toISOString(),
            status: "active",
            createdBy: "punter", // TODO: Get from session
        };

        betCodes.push(newBetCode);
        await writeBetCodes(betCodes);

        return NextResponse.json({ betCode: newBetCode }, { status: 201 });
    } catch (error) {
        console.error("Error creating bet code:", error);
        return NextResponse.json({ error: "Failed to create bet code" }, { status: 500 });
    }
}
