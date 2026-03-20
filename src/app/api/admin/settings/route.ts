import { NextRequest, NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/settings";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

export async function GET(req: NextRequest) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const settings = await readSettings();
    return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await req.json();
    const current = await readSettings();
    const updated = { ...current, ...body };
    await writeSettings(updated);
    return NextResponse.json({ settings: updated });
}
