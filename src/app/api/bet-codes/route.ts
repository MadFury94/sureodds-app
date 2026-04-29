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
    createdBy: string; // User ID
    createdByEmail?: string; // User email
    category: "free" | "sure-banker" | "premium" | "vip"; // Access level
    confidence?: string; // High, Medium, Low, Banker
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

export async function GET(req: NextRequest) {
    try {
        const betCodes = await readBetCodes();

        // Check if request is from authenticated user
        const user = await getUserFromSession(req);

        // Filter based on user subscription level
        let filteredCodes = betCodes;

        if (!user) {
            // Not logged in - only show free codes
            filteredCodes = betCodes.filter(bc => bc.category === "free");
        } else if (user.role === "admin") {
            // Admin sees everything
            filteredCodes = betCodes;
        } else {
            // Regular user - check subscription level
            // For now, show free + sure-banker for all logged-in users
            // TODO: Implement proper subscription checking
            filteredCodes = betCodes.filter(bc =>
                bc.category === "free" ||
                bc.category === "sure-banker"
            );
        }

        // Sort by created date, newest first
        filteredCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            betCodes: filteredCodes,
            userRole: user?.role || "guest",
            totalCount: betCodes.length,
            visibleCount: filteredCodes.length
        });
    } catch (error) {
        console.error("Error reading bet codes:", error);
        return NextResponse.json({ error: "Failed to load bet codes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    // Allow both authenticated users (punters) and admins to post bet codes
    const user = await getUserFromSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { bookmaker, code, link, image, description, odds, stake, expiresAt, category, confidence } = body;

        if (!bookmaker) {
            return NextResponse.json({ error: "Bookmaker is required" }, { status: 400 });
        }

        if (!code && !link && !image) {
            return NextResponse.json({ error: "At least one of code, link, or image is required" }, { status: 400 });
        }

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        const validCategories = ["free", "sure-banker", "premium", "vip"];
        if (!validCategories.includes(category)) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
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
            createdBy: user.id,
            createdByEmail: user.email,
            category: category,
            confidence: confidence || "Medium",
        };

        betCodes.push(newBetCode);
        await writeBetCodes(betCodes);

        return NextResponse.json({ betCode: newBetCode }, { status: 201 });
    } catch (error) {
        console.error("Error creating bet code:", error);
        return NextResponse.json({ error: "Failed to create bet code" }, { status: 500 });
    }
}
