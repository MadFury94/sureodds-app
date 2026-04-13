import nodemailer from "nodemailer";

const FROM = process.env.FROM_EMAIL ?? "noreply@sureodds.ng";
const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://sureodds.ng";

// Create transporter based on environment variables
function getTransporter() {
    // Option 1: Gmail (easiest for testing)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    // Option 2: Custom SMTP
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT ?? "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    throw new Error("No email configuration found. Set GMAIL_USER and GMAIL_APP_PASSWORD or SMTP settings.");
}

// Email HTML template
const base = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f5f6;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f5f6;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:560px;width:100%">
        <tr><td style="background:#0f0f0f;padding:28px 32px;text-align:center">
          <img src="${SITE}/logo.png" alt="Sureodds" height="36" style="display:block;margin:0 auto">
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e8ebed">
          <p style="margin:0;font-size:12px;color:#99989f">© ${new Date().getFullYear()} Sureodds · <a href="${SITE}" style="color:#ff6b00;text-decoration:none">sureodds.ng</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const h1 = (t: string) => `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.02em">${t}</h1>`;
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:#3d3c41;line-height:1.6">${t}</p>`;
const badge = (t: string, color = "#ff6b00") => `<span style="display:inline-block;padding:4px 12px;background:${color}22;border:1px solid ${color};border-radius:100px;font-size:12px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.06em">${t}</span>`;

// Send OTP Email
export async function sendOTPEmail(to: string, code: string, purpose: "login" | "register") {
    const isLogin = purpose === "login";

    try {
        const transporter = getTransporter();

        const info = await transporter.sendMail({
            from: `Sureodds <${FROM}>`,
            to,
            subject: isLogin ? "Your Login Code" : "Your Registration Code",
            html: base(`
                ${badge(isLogin ? "Login Code" : "Registration Code")}
                <br><br>
                ${h1(isLogin ? "Sign In to Sureodds" : "Complete Your Registration")}
                ${p(isLogin
                ? "Use the code below to sign in to your account:"
                : "Use the code below to complete your registration:"
            )}
                <div style="background:#f9fafb;border:2px solid #e8ebed;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
                    <p style="margin:0 0 8px;font-size:13px;color:#68676d;text-transform:uppercase;letter-spacing:0.06em;font-weight:700">Your Code</p>
                    <p style="margin:0;font-size:36px;font-weight:700;color:#ff6b00;letter-spacing:0.1em;font-family:monospace">${code}</p>
                </div>
                ${p("This code will expire in 5 minutes.")}
                ${p('<span style="font-size:13px;color:#68676d">If you didn\'t request this code, you can safely ignore this email.</span>')}
            `),
        });

        console.log("✅ Email sent via Nodemailer:", info.messageId);
        return { id: info.messageId };
    } catch (error) {
        console.error("❌ Nodemailer error:", error);
        throw error;
    }
}
