import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken, findUserById, updateUser, verifyPassword, toSafeUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
    const token = req.cookies.get("so_user_session")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const payload = await verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const user = await findUserById(payload.id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const body = await req.json();

    // Update name
    if (body.name !== undefined) {
        if (!body.name.trim()) return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
        const updated = await updateUser(user.id, { name: body.name.trim() });
        return NextResponse.json({ user: toSafeUser(updated!) });
    }

    // Change password
    if (body.currentPassword !== undefined) {
        const valid = await verifyPassword(body.currentPassword, user.passwordHash);
        if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
        if (!body.newPassword || body.newPassword.length < 8) {
            return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
        }
        const passwordHash = await bcrypt.hash(body.newPassword, 12);
        const updated = await updateUser(user.id, { passwordHash });
        return NextResponse.json({ user: toSafeUser(updated!) });
    }

    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
}
