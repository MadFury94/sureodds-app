import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken, toSafeUser } from "@/lib/auth-wordpress";
import { findUserByEmail } from "@/lib/auth-wordpress";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("so_user_session")?.value;

    console.log("🔍 /api/auth/me - Cookie check:");
    console.log("  Token found:", token ? "Yes" : "No");

    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const payload = await verifyUserToken(token);

    console.log("  Payload:", payload ? "Valid" : "Invalid");
    if (payload) {
        console.log("  Email:", payload.email);
        console.log("  Role:", payload.role);
        console.log("  Status (from token):", payload.status);
    }

    if (!payload) return NextResponse.json({ user: null }, { status: 401 });

    // Fetch fresh user data from WordPress
    const user = await findUserByEmail(payload.email);

    console.log("  User found in WordPress:", user ? "Yes" : "No");
    if (user) {
        console.log("  WordPress status:", user.status);
    }

    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    // Use WordPress status as source of truth
    // This ensures that when admin approves a user, the status is immediately reflected
    // Exception: If token has "active" status but WordPress has "pending", 
    // it means user is using magic link for first-time access
    let finalStatus = user.status;

    if (payload.status === "active" && user.status === "pending") {
        // Magic link scenario - allow temporary access
        console.log("  🔐 Magic link access detected - allowing temporary active status");
        finalStatus = "active";
    }

    const userWithFreshStatus = {
        ...user,
        status: finalStatus,
    };

    console.log("  Final status returned:", finalStatus);

    return NextResponse.json({ user: toSafeUser(userWithFreshStatus) });
}
