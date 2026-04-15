import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateUser, signUserToken } from "@/lib/auth-wordpress";
import { readSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
    const reference = req.nextUrl.searchParams.get("reference") ?? req.nextUrl.searchParams.get("trxref");
    if (!reference) return NextResponse.redirect(new URL("/subscribe?error=missing_ref", req.url));

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.redirect(new URL("/subscribe?error=config", req.url));

    // Verify with Paystack
    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
    });
    const psData = await psRes.json();

    if (!psData.status || psData.data?.status !== "success") {
        return NextResponse.redirect(new URL("/subscribe?error=payment_failed", req.url));
    }

    // Get user email from metadata (added in initiate)
    const userEmail = psData.data?.metadata?.userEmail;
    if (!userEmail) return NextResponse.redirect(new URL("/subscribe?error=no_user", req.url));

    const user = await findUserByEmail(userEmail);
    if (!user) return NextResponse.redirect(new URL("/subscribe?error=no_user", req.url));

    const settings = await readSettings();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + settings.subscriptionDurationDays);

    const updated = await updateUser(user.id, {
        status: "active",
        subscriptionExpiry: expiry.toISOString(),
        paymentMethod: "online",
        paymentRef: reference,
        approvedAt: new Date().toISOString(),
        approvedBy: "paystack",
    });

    if (!updated) return NextResponse.redirect(new URL("/subscribe?error=update_failed", req.url));

    // Refresh session cookie
    const newToken = await signUserToken({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        status: updated.status,
        subscriptionExpiry: updated.subscriptionExpiry,
    });

    const res = NextResponse.redirect(new URL("/dashboard?welcome=1", req.url));
    res.cookies.set("so_user_session", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
    });
    return res;
}
