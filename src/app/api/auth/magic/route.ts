import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/magic-link";
import { findUserByEmail, signUserToken } from "@/lib/auth-wordpress";

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Missing token parameter." },
                { status: 400 }
            );
        }

        // Verify the magic link
        const verification = await verifyMagicLink(token);

        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error || "Invalid magic link." },
                { status: 401 }
            );
        }

        // Find the user
        const user = await findUserByEmail(verification.email!);

        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 }
            );
        }

        // Allow suspended users to be blocked, but pending users can use magic link
        // (they just got approved, WordPress might not have updated yet)
        if (user.status === "suspended") {
            return NextResponse.json(
                { error: "Your account has been suspended. Contact support." },
                { status: 403 }
            );
        }

        // Create session token (force status to active since they have a valid magic link)
        const sessionToken = await signUserToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: "active", // Force active since they have a valid magic link
            subscriptionExpiry: user.subscriptionExpiry,
        });

        // Redirect to appropriate dashboard
        const dashboardUrl = user.role === "punter" ? "/dashboard/punter" : "/dashboard";

        const response = NextResponse.redirect(new URL(dashboardUrl, req.url));

        response.cookies.set("so_user_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Error processing magic link:", error);
        return NextResponse.json(
            { error: "Authentication failed. Please try logging in normally." },
            { status: 500 }
        );
    }
}
