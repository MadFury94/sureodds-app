import { NextRequest, NextResponse } from "next/server";

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API || "https://cms.sureodds.ng/wp-json/wp/v2";

function getAdminToken(req: NextRequest): string | null {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return null;
    try {
        const parsed = JSON.parse(session);
        return parsed?.token ?? null;
    } catch {
        return null;
    }
}

// GET /api/admin/categories
export async function GET(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(`${WP_API_URL}/categories?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

// POST /api/admin/categories — create a category
export async function POST(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const res = await fetch(`${WP_API_URL}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
