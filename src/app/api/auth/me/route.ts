import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken, findUserById, toSafeUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("so_user_session")?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const payload = await verifyUserToken(token);
    if (!payload) return NextResponse.json({ user: null }, { status: 401 });

    // Always fetch fresh from file so status/expiry changes are reflected
    const user = await findUserById(payload.id);
    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({ user: toSafeUser(user) });
}
