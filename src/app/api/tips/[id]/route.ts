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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = getSession(req);
    if (!session?.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const session = getSession(req);
    if (!session?.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const tips = readTips();
    const filtered = tips.filter((t: { id: number }) => t.id !== Number(id));
    if (filtered.length === tips.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    writeTips(filtered);
    return NextResponse.json({ success: true });
}
