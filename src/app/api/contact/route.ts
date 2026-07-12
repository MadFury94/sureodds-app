import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@sureodds.ng";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@sureodds.ng";

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }
        // Basic spam guard — message must be at least 10 chars
        if (message.trim().length < 10) {
            return NextResponse.json({ error: "Message is too short" }, { status: 400 });
        }

        // Send notification to admin
        await resend.emails.send({
            from: `Sureodds Contact <${FROM_EMAIL}>`,
            to: ADMIN_EMAIL,
            replyTo: email,
            subject: `Contact form: ${subject}`,
            html: `
<div style="font-family:Arial,sans-serif;max-width:600px;">
  <h2 style="color:#1a1a1a;">New Contact Form Submission</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:0.8rem;background:#f2f5f6;font-weight:700;width:120px;">Name</td><td style="padding:0.8rem;">${name}</td></tr>
    <tr><td style="padding:0.8rem;background:#f2f5f6;font-weight:700;">Email</td><td style="padding:0.8rem;"><a href="mailto:${email}">${email}</a></td></tr>
    <tr><td style="padding:0.8rem;background:#f2f5f6;font-weight:700;">Subject</td><td style="padding:0.8rem;">${subject}</td></tr>
    <tr><td style="padding:0.8rem;background:#f2f5f6;font-weight:700;vertical-align:top;">Message</td><td style="padding:0.8rem;white-space:pre-wrap;">${message}</td></tr>
  </table>
  <p style="color:#99989f;font-size:12px;margin-top:16px;">Reply directly to this email to respond to ${name}.</p>
</div>`,
        });

        // Send confirmation to user
        await resend.emails.send({
            from: `Sureodds <${FROM_EMAIL}>`,
            to: email,
            subject: "We received your message — Sureodds",
            html: `
<div style="font-family:Arial,sans-serif;max-width:600px;background:#fff;">
  <div style="background:#000;padding:24px;text-align:center;">
    <img src="https://sureodds.ng/logo.png" alt="Sureodds" style="height:40px;">
  </div>
  <div style="padding:32px 24px;">
    <h2 style="font-family:'Arial Black',sans-serif;color:#1a1a1a;margin:0 0 16px;">Message received</h2>
    <p style="color:#3d3c41;font-size:15px;line-height:1.7;margin:0 0 12px;">Hi ${name},</p>
    <p style="color:#3d3c41;font-size:15px;line-height:1.7;margin:0 0 12px;">
      Thanks for getting in touch. We've received your message about "<strong>${subject}</strong>" and will get back to you within 1–2 business days.
    </p>
    <p style="color:#3d3c41;font-size:15px;line-height:1.7;">The Sureodds Team</p>
  </div>
</div>`,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Contact form error:", err);
        return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
    }
}
