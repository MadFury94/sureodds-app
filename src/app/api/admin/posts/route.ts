import { NextRequest, NextResponse } from "next/server";

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API || "https://cms.sureodds.ng/wp-json/wp/v2";
const WP_JWT_BASE = process.env.NEXT_PUBLIC_WP_API?.replace("/wp/v2", "") ?? "https://cms.sureodds.ng/wp-json";

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

// GET /api/admin/posts — list posts
export async function GET(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "1";
    const perPage = searchParams.get("per_page") ?? "20";
    const status = searchParams.get("status") ?? "any";
    const search = searchParams.get("search") ?? "";

    const params = new URLSearchParams({ per_page: perPage, page, status, orderby: "date", order: "desc", _embed: "1" });
    if (search) params.set("search", search);

    const res = await fetch(`${WP_API_URL}/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    const data = await res.json();
    const totalPages = res.headers.get("X-WP-TotalPages") ?? "1";
    const total = res.headers.get("X-WP-Total") ?? "0";

    return NextResponse.json(data, {
        status: res.status,
        headers: { "X-WP-TotalPages": totalPages, "X-WP-Total": total },
    });
}

// POST /api/admin/posts — create a post
export async function POST(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate token is still good
    const validateRes = await fetch(`${WP_JWT_BASE}/jwt-auth/v1/token/validate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    if (!validateRes.ok) return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });

    const body = await req.json();

    const res = await fetch(`${WP_API_URL}/posts`, {
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
