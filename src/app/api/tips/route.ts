import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { verifyUserToken } from "@/lib/auth";

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
    // WP admin session
    const adminRaw = req.cookies.get("so_admin_session")?.value;
    if (adminRaw) {
        try { if (JSON.parse(adminRaw)?.token) return true; } catch { /* */ }
    }
    // Punter / tips-admin session
    const userToken = req.cookies.get("so_user_session")?.value;
    if (userToken) {
        const payload = await verifyUserToken(userToken);
        if (payload?.role === "punter" || payload?.role === "tips-admin") return true;
    }
    return false;
}

export async function GET() {
    return NextResponse.json(readTips());
}

export async function POST(req: NextRequest) {
    if (!(await isAuthorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const tips = readTips();
    const maxId = tips.reduce((m: number, t: { id: number }) => Math.max(m, t.id), 0);
    const newTip = { ...body, id: maxId + 1 };
    tips.push(newTip);
    writeTips(tips);
    return NextResponse.json(newTip, { status: 201 });
}
