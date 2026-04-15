import { NextRequest, NextResponse } from "next/server";
import { sendApprovalEmailWithMagicLink } from "@/lib/email-nodemailer";
import { createMagicLink } from "@/lib/magic-link";

export async function GET(req: NextRequest) {
    try {
        // Get email from query parameter or use a default
        const testEmail = req.nextUrl.searchParams.get("email") || "thecybertechhq@gmail.com";

        console.log("🧪 [test-magic-link] Testing magic link email to:", testEmail);

        // Create a test magic link
        const magicToken = createMagicLink(testEmail, "punter");
        console.log("🧪 [test-magic-link] Generated token:", magicToken.substring(0, 30) + "...");

        // Send the email
        await sendApprovalEmailWithMagicLink(
            testEmail,
            "Test User",
            "punter",
            magicToken,
            "15 April 2027"
        );

        console.log("🧪 [test-magic-link] Email sent successfully!");

        return NextResponse.json({
            success: true,
            message: "Test magic link email sent successfully!",
            sentTo: testEmail,
            tokenPreview: magicToken.substring(0, 30) + "..."
        });
    } catch (error) {
        console.error("🧪 [test-magic-link] Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            details: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
