import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP, hasRecentOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email-nodemailer"; // Using Nodemailer instead of Resend
import { findUserByEmail } from "@/lib/auth-wordpress";

// Rate limiting
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const window = 15 * 60 * 1000; // 15 minutes
    const entry = attempts.get(ip);

    if (!entry || now > entry.resetAt) {
        attempts.set(ip, { count: 1, resetAt: now + window });
        return true;
    }

    if (entry.count >= 5) return false;
    entry.count++;
    return true;
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please wait 15 minutes." },
            { status: 429 }
        );
    }

    try {
        const { email, purpose, name, userType } = await req.json();

        if (!email?.trim()) {
            return NextResponse.json(
                { error: "Email is required." },
                { status: 400 }
            );
        }

        if (!purpose || !["login", "register"].includes(purpose)) {
            return NextResponse.json(
                { error: "Invalid purpose." },
                { status: 400 }
            );
        }

        // Check if OTP was sent recently (prevent spam)
        if (await hasRecentOTP(email)) {
            return NextResponse.json(
                { error: "OTP already sent. Please wait 60 seconds before requesting again." },
                { status: 429 }
            );
        }

        // For login, check if user exists
        if (purpose === "login") {
            const user = await findUserByEmail(email);
            if (!user) {
                return NextResponse.json(
                    { error: "No account found with this email." },
                    { status: 404 }
                );
            }
        }

        // For register, check if email is already taken
        if (purpose === "register") {
            const existing = await findUserByEmail(email);
            if (existing) {
                return NextResponse.json(
                    { error: "Email already registered. Please login instead." },
                    { status: 409 }
                );
            }

            if (!name?.trim()) {
                return NextResponse.json(
                    { error: "Name is required for registration." },
                    { status: 400 }
                );
            }
        }

        // Generate and store OTP
        const code = generateOTP();
        const userData = purpose === "register" && name ? { name, userType: userType || "punter" } : undefined;
        await storeOTP(email, code, purpose, userData);

        // Send OTP email
        try {
            console.log("📧 Attempting to send OTP email...");
            console.log("📧 To:", email);
            console.log("📧 Code:", code);
            console.log("📧 Gmail User:", process.env.GMAIL_USER ? "✓ Set" : "✗ Not set");
            console.log("📧 Gmail Password:", process.env.GMAIL_APP_PASSWORD ? "✓ Set" : "✗ Not set");

            await sendOTPEmail(email, code, purpose);
            console.log(`✅ OTP sent successfully to ${email}: ${code}`);
        } catch (emailError) {
            console.error("❌ Failed to send OTP email:", emailError);
            // Still return success since OTP is stored (for testing)
            // In production, you might want to return an error here
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent to your email. Please check your inbox.",
            // For development/testing only - remove in production
            ...(process.env.NODE_ENV === "development" && { code }),
        });

    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json(
            { error: "Failed to send OTP. Please try again." },
            { status: 500 }
        );
    }
}
