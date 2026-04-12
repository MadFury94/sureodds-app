import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { findUserByEmail, createUser, signUserToken, toSafeUser } from "@/lib/auth";
import { sendWelcomeEmail, sendNewUserNotificationToAdmin } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        if (!email?.trim() || !code?.trim()) {
            return NextResponse.json(
                { error: "Email and code are required." },
                { status: 400 }
            );
        }

        // Verify OTP
        const verification = verifyOTP(email, code);

        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error || "Invalid OTP." },
                { status: 401 }
            );
        }

        let user;

        // Handle login
        if (verification.purpose === "login") {
            user = await findUserByEmail(email);

            if (!user) {
                return NextResponse.json(
                    { error: "User not found." },
                    { status: 404 }
                );
            }

            if (user.status === "suspended") {
                return NextResponse.json(
                    { error: "Your account has been suspended. Contact support." },
                    { status: 403 }
                );
            }
        }

        // Handle registration
        if (verification.purpose === "register") {
            if (!verification.userData?.name) {
                return NextResponse.json(
                    { error: "Registration data missing." },
                    { status: 400 }
                );
            }

            // Create user without password (OTP-based auth)
            const role = verification.userData.userType === "punter" ? "punter" : undefined;

            user = await createUser({
                name: verification.userData.name,
                email,
                password: Math.random().toString(36).slice(2) + Date.now().toString(36), // Random password (not used)
                role,
            });

            // Send welcome email only to subscribers (not punters)
            if (user.role === "subscriber") {
                sendWelcomeEmail(user.email, user.name);
            }

            // Notify admin about new registration
            sendNewUserNotificationToAdmin({
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }

        if (!user) {
            return NextResponse.json(
                { error: "Authentication failed." },
                { status: 500 }
            );
        }

        // Create session token
        const token = await signUserToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            subscriptionExpiry: user.subscriptionExpiry,
        });

        const res = NextResponse.json({
            user: toSafeUser(user),
            isNewUser: verification.purpose === "register",
        });

        res.cookies.set("so_user_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return res;

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            { error: "Verification failed. Please try again." },
            { status: 500 }
        );
    }
}
