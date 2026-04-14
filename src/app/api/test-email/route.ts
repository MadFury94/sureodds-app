import { NextRequest, NextResponse } from "next/server";
import { sendOTPEmail } from "@/lib/email-nodemailer";

// Test endpoint to verify Gmail/Nodemailer configuration
export async function GET(req: NextRequest) {
    try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPassword = process.env.GMAIL_APP_PASSWORD;
        const fromEmail = process.env.FROM_EMAIL ?? "noreply@sureodds.ng";

        // Check if Gmail credentials exist
        if (!gmailUser || !gmailPassword) {
            return NextResponse.json({
                success: false,
                error: "Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local",
                config: {
                    hasGmailUser: !!gmailUser,
                    hasGmailPassword: !!gmailPassword,
                    fromEmail,
                }
            });
        }

        // Get test email from query params or use Gmail user
        const testEmail = req.nextUrl.searchParams.get("email") ?? gmailUser;

        console.log("🧪 Testing email configuration...");
        console.log("📧 Gmail User:", gmailUser);
        console.log("📧 From Email:", fromEmail);
        console.log("📧 Test Email To:", testEmail);

        // Try to send a test OTP email
        await sendOTPEmail(testEmail, "123456", "login");

        return NextResponse.json({
            success: true,
            message: `Test email sent successfully to ${testEmail}!`,
            config: {
                hasGmailUser: true,
                hasGmailPassword: true,
                gmailUser,
                fromEmail,
                testEmailSentTo: testEmail,
            }
        });

    } catch (error) {
        console.error("❌ Test email failed:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            details: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}
