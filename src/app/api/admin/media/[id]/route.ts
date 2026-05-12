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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = getAdminToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const res = await fetch(`${WP_API_URL}/media/${id}?force=true`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(err, { status: res.status });
    }

    return NextResponse.json({ success: true });
}
