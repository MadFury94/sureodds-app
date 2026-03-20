import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Protect all /admin-dashboard routes
    if (pathname.startsWith("/admin-dashboard")) {
        const session = req.cookies.get("so_admin_session")?.value;

        if (!session) {
            const loginUrl = new URL("/admin-login", req.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const parsed = JSON.parse(session);
            if (!parsed?.token || !parsed?.roles?.length) throw new Error("Invalid session");
        } catch {
            return NextResponse.redirect(new URL("/admin-login", req.url));
        }
    }

    // Redirect logged-in users away from login page
    if (pathname === "/admin-login") {
        const session = req.cookies.get("so_admin_session")?.value;
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed?.token) return NextResponse.redirect(new URL("/admin-dashboard", req.url));
            } catch { /* invalid cookie, let them through */ }
        }
    }

    // Inject pathname so layout.tsx can conditionally hide Navbar/Footer
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.webp|.*\\.ico).*)"],
};
