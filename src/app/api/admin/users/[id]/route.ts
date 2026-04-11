import { NextRequest, NextResponse } from "next/server";
import { readUsers, writeUsers, updateUser, toSafeUser, findUserById } from "@/lib/auth";
import { readSettings } from "@/lib/settings";
import { sendApprovalEmail, sendSuspensionEmail } from "@/lib/email";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

// Approve subscriber
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const { action } = await req.json(); // "approve" | "suspend"

    const user = await findUserById(id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (action === "approve") {
        const settings = await readSettings();

        // Punters don't need subscription expiry, subscribers do
        const isPunter = user.role === "punter";
        const expiry = isPunter ? null : new Date();
        if (expiry) {
            expiry.setDate(expiry.getDate() + settings.subscriptionDurationDays);
        }

        const updated = await updateUser(id, {
            status: "active",
            subscriptionExpiry: expiry ? expiry.toISOString() : null,
            approvedAt: new Date().toISOString(),
            approvedBy: "admin",
        });

        // Notify user with role-specific email
        sendApprovalEmail(
            user.email,
            user.name,
            user.role as "punter" | "subscriber",
            expiry ? expiry.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined
        );

        return NextResponse.json({ user: toSafeUser(updated!) });
    }

    if (action === "suspend") {
        const updated = await updateUser(id, { status: "suspended" });
        // Notify user
        sendSuspensionEmail(user.email, user.name);
        return NextResponse.json({ user: toSafeUser(updated!) });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

// Delete user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const users = await readUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return NextResponse.json({ error: "User not found." }, { status: 404 });
    await writeUsers(filtered);
    return NextResponse.json({ ok: true });
}
