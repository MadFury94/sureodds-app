import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Test endpoint to verify Resend configuration
export async function GET(req: NextRequest) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

        // Check if API key exists
        if (!apiKey || apiKey.startsWith("re_xxx")) {
            return NextResponse.json({
                success: false,
                error: "RESEND_API_KEY not configured",
                config: {
                    hasApiKey: false,
                    fromEmail,
                }
            });
        }

        // Try to send a test email
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from: `Sureodds Test <${fromEmail}>`,
            to: "delivered@resend.dev", // Resend test address
            subject: "Test Email - Sureodds",
            html: "<p>This is a test email to verify Resend configuration.</p>",
        });

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                config: {
                    hasApiKey: true,
                    apiKeyPrefix: apiKey.substring(0, 8) + "...",
                    fromEmail,
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Email sent successfully!",
            emailId: data?.id,
            config: {
                hasApiKey: true,
                apiKeyPrefix: apiKey.substring(0, 8) + "...",
                fromEmail,
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
