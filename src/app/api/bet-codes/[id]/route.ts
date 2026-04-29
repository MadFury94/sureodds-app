import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyUserToken } from "@/lib/auth-wordpress";

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
    createdByEmail?: string;
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

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

async function getUserFromSession(req: NextRequest): Promise<{ id: string; email: string; role: string } | null> {
    // Check user session (for punters)
    const userToken = req.cookies.get("so_user_session")?.value;
    if (userToken) {
        const payload = await verifyUserToken(userToken);
        if (payload) {
            return {
                id: payload.email, // Use email as ID for now
                email: payload.email,
                role: payload.role || "punter",
            };
        }
    }

    // Check admin session
    const adminSession = req.cookies.get("so_admin_session")?.value;
    if (adminSession) {
        try {
            const session = JSON.parse(adminSession);
            if (session?.token) {
                return {
                    id: "admin",
                    email: "admin",
                    role: "admin",
                };
            }
        } catch { }
    }

    return null;
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Allow users to delete their own bet codes, or admins to delete any
    const user = await getUserFromSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const betCodes = await readBetCodes();
        const betCode = betCodes.find(bc => bc.id === id);

        if (!betCode) {
            return NextResponse.json({ error: "Bet code not found" }, { status: 404 });
        }

        // Check if user owns this bet code or is admin
        const isOwner = betCode.createdBy === user.id || betCode.createdByEmail === user.email;
        const isAdmin = user.role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "You can only delete your own bet codes" }, { status: 403 });
        }

        const filtered = betCodes.filter(bc => bc.id !== id);
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
    // Only admins can update bet code status
    if (!isAdminAuthed(req)) {
        return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

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
