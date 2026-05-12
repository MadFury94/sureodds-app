import { NextRequest, NextResponse } from "next/server";

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API || "https://sureodds.ng/wp-json/wp/v2";

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

// GET /api/admin/tags?search=...
export async function GET(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";

    const params = new URLSearchParams({ per_page: "20" });
    if (search) params.set("search", search);

    const res = await fetch(`${WP_API_URL}/tags?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

// POST /api/admin/tags — create a tag
export async function POST(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const res = await fetch(`${WP_API_URL}/tags`, {
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
