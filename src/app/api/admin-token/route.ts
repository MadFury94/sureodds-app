import { NextRequest, NextResponse } from "next/server";

// Returns the WP JWT token from the httpOnly session cookie
// Only called server-side from the new-post page via fetch
export async function GET(req: NextRequest) {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return NextResponse.json({ token: null }, { status: 401 });

    try {
        const parsed = JSON.parse(session);
        if (!parsed?.token) return NextResponse.json({ token: null }, { status: 401 });
        return NextResponse.json({ token: parsed.token });
    } catch {
        return NextResponse.json({ token: null }, { status: 401 });
    }
}
