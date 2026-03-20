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

function getSession(req: NextRequest) {
    const raw = req.cookies.get("so_admin_session")?.value;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export async function GET() {
    return NextResponse.json(readTips());
}

export async function POST(req: NextRequest) {
    const session = getSession(req);
    if (!session?.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const tips = readTips();
    const maxId = tips.reduce((m: number, t: { id: number }) => Math.max(m, t.id), 0);
    const newTip = { ...body, id: maxId + 1 };
    tips.push(newTip);
    writeTips(tips);
    return NextResponse.json(newTip, { status: 201 });
}
