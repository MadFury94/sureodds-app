import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@sureodds.ng";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@sureodds.ng";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        // Add contact to Resend audience (if audience ID is configured)
        if (AUDIENCE_ID) {
            await resend.contacts.create({
                email,
                audienceId: AUDIENCE_ID,
                unsubscribed: false,
            });
        }

        // Send welcome email to subscriber
        await resend.emails.send({
            from: `Sureodds <${FROM_EMAIL}>`,
            to: email,
            subject: "Welcome to Sureodds — Football News in Your Inbox",
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f5f6;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:#000;padding:2.4rem;text-align:center;">
      <img src="https://sureodds.ng/logo.png" alt="Sureodds" style="height:48px;width:auto;">
    </div>
    <div style="padding:3.2rem 2.4rem;">
      <h1 style="font-family:'Arial Black',sans-serif;font-size:2.4rem;color:#1a1a1a;margin:0 0 1.6rem;text-transform:uppercase;">
        You're in. ⚽
      </h1>
      <p style="font-size:1.6rem;color:#3d3c41;line-height:1.75;margin:0 0 1.6rem;">
        Thanks for subscribing to Sureodds. You'll now receive the latest football news, transfer updates, match previews and betting tips straight to your inbox.
      </p>
      <p style="font-size:1.6rem;color:#3d3c41;line-height:1.75;margin:0 0 2.4rem;">
        While you wait for your first newsletter, catch up on the latest at:
      </p>
      <a href="https://sureodds.ng" style="display:inline-block;padding:1.2rem 2.8rem;background:#ff6b00;border-radius:0.6rem;font-family:'Arial Black',sans-serif;font-size:1.4rem;font-weight:700;color:#fff;text-decoration:none;text-transform:uppercase;">
        Visit Sureodds →
      </a>
    </div>
    <div style="background:#f2f5f6;padding:1.6rem 2.4rem;text-align:center;border-top:1px solid #e8ebed;">
      <p style="font-size:1.1rem;color:#99989f;margin:0;">
        You're receiving this because you subscribed at sureodds.ng.<br>
        <a href="https://sureodds.ng/privacy-policy" style="color:#99989f;">Privacy Policy</a> · 
        <a href="https://sureodds.ng/terms-of-use" style="color:#99989f;">Terms of Use</a>
      </p>
    </div>
  </div>
</body>
</html>`,
        });

        // Notify admin
        await resend.emails.send({
            from: `Sureodds <${FROM_EMAIL}>`,
            to: ADMIN_EMAIL,
            subject: `New newsletter subscriber: ${email}`,
            html: `<p>New subscriber: <strong>${email}</strong></p>`,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Newsletter signup error:", err);
        return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
    }
}
