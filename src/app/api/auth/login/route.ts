import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, signUserToken, toSafeUser } from "@/lib/auth";

// Simple in-memory rate limiter: max 5 attempts per IP per 15 min
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const window = 15 * 60 * 1000;
    const entry = attempts.get(ip);
    if (!entry || now > entry.resetAt) {
        attempts.set(ip, { count: 1, resetAt: now + window });
        return true;
    }
    if (entry.count >= 5) return false;
    entry.count++;
    return true;
}

function clearAttempts(ip: string) {
    attempts.delete(ip);
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many login attempts. Please wait 15 minutes." },
            { status: 429 }
        );
    }

    try {
        const { email, password } = await req.json();

        if (!email?.trim() || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        if (user.status === "suspended") {
            return NextResponse.json({ error: "Your account has been suspended. Contact support." }, { status: 403 });
        }

        clearAttempts(ip);

        const token = await signUserToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            subscriptionExpiry: user.subscriptionExpiry,
        });

        const res = NextResponse.json({ user: toSafeUser(user) });
        res.cookies.set("so_user_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });
        return res;
    } catch {
        return NextResponse.json({ error: "Login failed." }, { status: 500 });
    }
}
