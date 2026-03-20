import { NextRequest, NextResponse } from "next/server";
import { readUsers, toSafeUser } from "@/lib/auth";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

export async function GET(req: NextRequest) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const users = await readUsers();
    return NextResponse.json({ users: users.map(toSafeUser) });
}
