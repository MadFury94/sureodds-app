import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken, findUserByEmail } from "@/lib/auth-wordpress";
import { readSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
    const token = req.cookies.get("so_user_session")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const payload = await verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const user = await findUserByEmail(payload.email);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const settings = await readSettings();
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "Payment gateway not configured." }, { status: 503 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: user.email,
            amount: settings.subscriptionPrice * 100, // Paystack uses kobo
            currency: settings.subscriptionCurrency,
            reference: `so_${user.id}_${Date.now()}`,
            callback_url: `${appUrl}/api/payment/verify`,
            metadata: { userId: user.id, userName: user.name, userEmail: user.email },
        }),
    });

    const data = await res.json();
    if (!data.status) {
        return NextResponse.json({ error: "Could not initiate payment." }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl: data.data.authorization_url, reference: data.data.reference });
}
