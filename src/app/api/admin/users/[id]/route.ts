import { NextRequest, NextResponse } from "next/server";
import { updateUser, toSafeUser, findUserByEmail } from "@/lib/auth-wordpress";
import { readSettings } from "@/lib/settings";
import { sendApprovalEmailWithMagicLink, sendSuspensionEmail } from "@/lib/email-nodemailer";
import { createMagicLink } from "@/lib/magic-link";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

// Approve subscriber
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const { action, email } = await req.json(); // "approve" | "suspend", need email to find user

    // WordPress uses numeric IDs, but we need to find user by email or ID
    // For now, we'll need the email passed from frontend
    const user = await findUserByEmail(email);
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

        // Generate magic link for one-time dashboard access
        const magicToken = createMagicLink(user.email, user.role);

        // Notify user with role-specific email and magic link
        sendApprovalEmailWithMagicLink(
            user.email,
            user.name,
            user.role as "punter" | "subscriber",
            magicToken,
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

// Delete user - WordPress API will handle this
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;

    // TODO: Implement WordPress user deletion via API
    // For now, return not implemented
    return NextResponse.json({ error: "User deletion must be done through WordPress admin panel." }, { status: 501 });
}
