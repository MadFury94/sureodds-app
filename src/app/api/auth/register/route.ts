import { NextRequest, NextResponse } from "next/server";
import { createUser, signUserToken, toSafeUser } from "@/lib/auth-wordpress";
import { sendWelcomeEmail, sendNewUserNotificationToAdmin } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password, confirmPassword, userType } = body;

        // Only allow role override if caller has an admin session
        const adminRaw = req.cookies.get("so_admin_session")?.value;
        const isAdmin = adminRaw ? !!JSON.parse(adminRaw)?.token : false;
        const role = isAdmin && body.role ? body.role : (userType === "punter" ? "punter" : undefined);

        if (!name?.trim() || !email?.trim() || !password) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
        }

        const user = await createUser({ name, email, password, role });

        // Send welcome email only to subscribers
        if (!role || role === "subscriber") {
            sendWelcomeEmail(user.email, user.name);
        }

        // Notify admin about new registration (both punters and subscribers)
        sendNewUserNotificationToAdmin({
            name: user.name,
            email: user.email,
            role: user.role,
        });

        const token = await signUserToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            subscriptionExpiry: user.subscriptionExpiry,
        });

        const res = NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
        res.cookies.set("so_user_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Registration failed.";
        const status = message === "Email already registered" ? 409 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
