import { NextRequest, NextResponse } from "next/server";
import { readUsers, toSafeUser } from "@/lib/auth-wordpress";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    try {
        console.log("📋 [GET /api/admin/users] Fetching users from WordPress...");
        const users = await readUsers();
        console.log("✅ [GET /api/admin/users] Fetched", users.length, "users");

        const response = NextResponse.json({ users: users.map(toSafeUser) });

        // Add cache control headers to prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error("❌ [GET /api/admin/users] Error fetching users:", error);
        return NextResponse.json({
            error: "Failed to fetch users from WordPress",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
