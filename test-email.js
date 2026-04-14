// Quick email test script
// Run with: node test-email.js

const nodemailer = require("nodemailer");

// Your Gmail credentials from .env.local
const GMAIL_USER = "thecybertechhq@gmail.com";
const GMAIL_APP_PASSWORD = "iajv wphc wftk zgzw"; // Spaces will be removed

async function testEmail() {
    console.log("🧪 Testing Gmail SMTP connection...\n");
    
    // Remove spaces from password
    const cleanPassword = GMAIL_APP_PASSWORD.replace(/\s/g, "");
    
    console.log("📧 Configuration:");
    console.log("   Gmail User:", GMAIL_USER);
    console.log("   Password Length:", cleanPassword.length);
    console.log("   Password (first 4 chars):", cleanPassword.substring(0, 4) + "...");
    console.log("");

    try {
        // Create transporter
        console.log("📧 Creating transporter...");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL_USER,
                pass: cleanPassword,
            },
        });

        // Verify connection
        console.log("📧 Verifying connection...");
        await transporter.verify();
        console.log("✅ Connection verified!\n");

        // Send test email
        console.log("📧 Sending test email...");
        const info = await transporter.sendMail({
            from: `Sureodds Test <${GMAIL_USER}>`,
            to: GMAIL_USER, // Send to yourself
            subject: "Test Email - Sureodds OTP System",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #ff6b00;">✅ Email System Working!</h1>
                    <p>This is a test email from your Sureodds application.</p>
                    <p>If you received this, your Gmail SMTP configuration is correct.</p>
                    <div style="background: #f9fafb; border: 2px solid #e8ebed; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                        <p style="margin: 0 0 8px; font-size: 13px; color: #68676d; text-transform: uppercase;">Test OTP Code</p>
                        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #ff6b00; letter-spacing: 0.1em; font-family: monospace;">123456</p>
                    </div>
                    <p style="font-size: 12px; color: #999;">Sent at: ${new Date().toLocaleString()}</p>
                </div>
            `,
        });

        console.log("✅ Email sent successfully!");
        console.log("✅ Message ID:", info.messageId);
        console.log("✅ Response:", info.response);
        console.log("\n📬 Check your inbox:", GMAIL_USER);
        console.log("   (Also check spam folder if not in inbox)\n");

    } catch (error) {
        console.error("\n❌ Error occurred:");
        console.error("   Type:", error.constructor.name);
        console.error("   Message:", error.message);
        console.error("   Code:", error.code);
        console.error("\n💡 Common solutions:");
        console.error("   1. Make sure 2FA is enabled on your Gmail account");
        console.error("   2. Generate a new App Password at: https://myaccount.google.com/apppasswords");
        console.error("   3. Make sure you're using the App Password, not your regular Gmail password");
        console.error("   4. Check if Gmail blocked the sign-in attempt at: https://myaccount.google.com/notifications");
        console.error("");
    }
}

testEmail();
