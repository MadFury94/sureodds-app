import { NextRequest, NextResponse } from "next/server";

const WP_BASE = process.env.NEXT_PUBLIC_WP_API?.replace("/wp/v2", "") ?? "https://sureodds.ng/wp-json";
const WP_JWT_BASE = "https://sureodds.ng/wp-json";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
        }

        // 1. Get JWT token from WordPress
        const tokenRes = await fetch(`${WP_JWT_BASE}/jwt-auth/v1/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            cache: "no-store",
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.json().catch(() => ({}));
            const msg = (err as any)?.message ?? "Invalid credentials.";
            return NextResponse.json({ error: msg }, { status: 401 });
        }

        const tokenData = await tokenRes.json();
        const token: string = tokenData.token;

        // 2. Fetch the user's profile to check their role
        const meRes = await fetch(`${WP_JWT_BASE}/wp/v2/users/me?context=edit`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!meRes.ok) {
            return NextResponse.json({ error: "Could not verify user role." }, { status: 403 });
        }

        const me = await meRes.json();
        const roles: string[] = me.roles ?? [];

        // Only allow admins and editors
        const ALLOWED_ROLES = ["administrator", "editor", "author"];
        const hasAccess = roles.some(r => ALLOWED_ROLES.includes(r));

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied. You do not have permission to access the admin panel." },
                { status: 403 }
            );
        }

        // 3. Set httpOnly session cookie
        const session = {
            token,
            userId: me.id,
            name: me.name,
            email: me.email,
            roles,
            avatar: me.avatar_urls?.["96"] ?? null,
        };

        const response = NextResponse.json({
            success: true,
            user: { name: me.name, email: me.email, roles, avatar: session.avatar },
        });

        response.cookies.set("so_admin_session", JSON.stringify(session), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 8, // 8 hours
        });

        return response;

    } catch (err) {
        console.error("[wordpress-auth]", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}

export async function DELETE() {
    // Logout — clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("so_admin_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });
    return response;
}

// Validate an existing token (called by middleware or client)
export async function GET(req: NextRequest) {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return NextResponse.json({ valid: false }, { status: 401 });

    try {
        const parsed = JSON.parse(session);
        if (!parsed?.token) return NextResponse.json({ valid: false }, { status: 401 });

        // Validate token against WP
        const validateRes = await fetch(`${WP_JWT_BASE}/jwt-auth/v1/token/validate`, {
            method: "POST",
            headers: { Authorization: `Bearer ${parsed.token}` },
            cache: "no-store",
        });

        if (!validateRes.ok) return NextResponse.json({ valid: false }, { status: 401 });

        return NextResponse.json({ valid: true, user: { name: parsed.name, email: parsed.email, roles: parsed.roles, avatar: parsed.avatar } });
    } catch {
        return NextResponse.json({ valid: false }, { status: 401 });
    }
}
