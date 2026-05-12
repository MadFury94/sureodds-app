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

// GET /api/admin/media — list media items
export async function GET(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "1";
    const perPage = searchParams.get("per_page") ?? "24";
    const mediaType = searchParams.get("media_type") ?? "";

    const params = new URLSearchParams({ per_page: perPage, page, orderby: "date", order: "desc" });
    if (mediaType) params.set("media_type", mediaType);

    const res = await fetch(`${WP_API_URL}/media?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    const data = await res.json();
    const totalPages = res.headers.get("X-WP-TotalPages") ?? "1";

    return NextResponse.json(data, {
        status: res.status,
        headers: { "X-WP-TotalPages": totalPages },
    });
}

// POST /api/admin/media — upload a file
export async function POST(req: NextRequest) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") ?? "application/octet-stream";
    const contentDisposition = req.headers.get("content-disposition") ?? "";
    const body = await req.arrayBuffer();

    const res = await fetch(`${WP_API_URL}/media`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": contentType,
            "Content-Disposition": contentDisposition,
        },
        body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

// DELETE /api/admin/media/[id] is handled in the [id] sub-route
