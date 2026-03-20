import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { verifyUserToken } from "@/lib/auth";

const TIPS_FILE = path.join(process.cwd(), "src/data/tips.json");

function readTips() {
    try { return JSON.parse(readFileSync(TIPS_FILE, "utf-8")); } catch { return []; }
}
function writeTips(tips: unknown[]) {
    writeFileSync(TIPS_FILE, JSON.stringify(tips, null, 2));
}

async function isAuthorized(req: NextRequest): Promise<boolean> {
    const adminRaw = req.cookies.get("so_admin_session")?.value;
    if (adminRaw) {
        try { if (JSON.parse(adminRaw)?.token) return true; } catch { /* */ }
    }
    const userToken = req.cookies.get("so_user_session")?.value;
    if (userToken) {
        const payload = await verifyUserToken(userToken);
        if (payload?.role === "punter" || payload?.role === "tips-admin") return true;
    }
    return false;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAuthorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const tips = readTips();
    const idx = tips.findIndex((t: { id: number }) => t.id === Number(id));
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    tips[idx] = { ...tips[idx], ...body, id: Number(id) };
    writeTips(tips);
    return NextResponse.json(tips[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAuthorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const tips = readTips();
    const filtered = tips.filter((t: { id: number }) => t.id !== Number(id));
    if (filtered.length === tips.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    writeTips(filtered);
    return NextResponse.json({ success: true });
}
