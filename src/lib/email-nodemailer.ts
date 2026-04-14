import nodemailer from "nodemailer";

const FROM = process.env.FROM_EMAIL ?? "noreply@sureodds.ng";
const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://sureodds.ng";

// Create transporter based on environment variables
function getTransporter() {
    // Option 1: Gmail (easiest for testing)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        // Remove spaces from app password (Gmail app passwords sometimes have spaces for readability)
        const cleanPassword = process.env.GMAIL_APP_PASSWORD.replace(/\s/g, "");

        console.log("📧 Creating Gmail transporter...");
        console.log("📧 Gmail User:", process.env.GMAIL_USER);
        console.log("📧 Password length:", cleanPassword.length);

        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: cleanPassword,
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
        console.log("📧 [sendOTPEmail] Starting email send...");
        console.log("📧 [sendOTPEmail] To:", to);
        console.log("📧 [sendOTPEmail] Code:", code);
        console.log("📧 [sendOTPEmail] Purpose:", purpose);

        const transporter = getTransporter();

        console.log("📧 [sendOTPEmail] Transporter created successfully");

        const mailOptions = {
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
        };

        console.log("📧 [sendOTPEmail] Sending email with options:", {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
        });

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ [sendOTPEmail] Email sent successfully!");
        console.log("✅ [sendOTPEmail] Message ID:", info.messageId);
        console.log("✅ [sendOTPEmail] Response:", info.response);

        return { id: info.messageId };
    } catch (error) {
        console.error("❌ [sendOTPEmail] Failed to send email");
        console.error("❌ [sendOTPEmail] Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("❌ [sendOTPEmail] Error message:", error instanceof Error ? error.message : String(error));
        console.error("❌ [sendOTPEmail] Full error:", error);
        throw error;
    }
}

// Send Approval Email with Magic Link
export async function sendApprovalEmailWithMagicLink(to: string, name: string, role: "punter" | "subscriber", magicToken: string, expiryDate?: string) {
    const isPunter = role === "punter";
    const dashboardUrl = `${SITE}/auth/magic?token=${magicToken}`;

    try {
        const transporter = getTransporter();

        const info = await transporter.sendMail({
            from: `Sureodds <${FROM}>`,
            to,
            subject: isPunter
                ? "✅ Punter Account Activated — Start Posting!"
                : "✅ Subscription Activated — Welcome to Sureodds!",
            html: base(`
                ${badge("Account Active", "#16a34a")}
                <br><br>
                ${h1(`You're in, ${name.split(" ")[0]}!`)}
                ${p(isPunter
                ? "Your punter account has been approved and is now active. You can now start posting predictions and blog articles."
                : "Your payment has been confirmed and your subscription is now active."
            )}
                ${isPunter ? "" : `
                    <table style="width:100%;border-collapse:collapse;margin:16px 0 24px">
                        <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#68676d;width:140px">Status</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:700;color:#16a34a">Active ✓</td></tr>
                        <tr><td style="padding:10px 0;font-size:14px;color:#68676d">Expires</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#1a1a1a">${expiryDate}</td></tr>
                    </table>
                `}
                ${p(isPunter
                ? "You now have full access to post betting tips and write articles for our subscribers."
                : "You now have full access to daily expert tips, analysis, and your members dashboard."
            )}
                <div style="text-align:center;margin:24px 0">
                    <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;background:#ff6b00;color:#fff;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em">Access Your Dashboard →</a>
                </div>
                <div style="background:#fff7f0;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:24px 0">
                    <p style="margin:0;font-size:13px;color:#68676d;line-height:1.6">
                        <strong style="color:#ff6b00">🔐 One-Time Access Link</strong><br>
                        This link will log you in automatically and expires in 24 hours. For future logins, use the regular login page with OTP verification.
                    </p>
                </div>
                <hr style="border:none;border-top:1px solid #e8ebed;margin:28px 0">
                ${p(`<span style="font-size:13px;color:#68676d">For future logins, visit: <a href="${SITE}/login" style="color:#ff6b00;text-decoration:none;font-weight:700">${SITE}/login</a> and we'll send you a code.</span>`)}
            `),
        });

        console.log("✅ Approval email with magic link sent via Nodemailer:", info.messageId);
        return { id: info.messageId };
    } catch (error) {
        console.error("❌ Failed to send approval email:", error);
        throw error;
    }
}

// Send Suspension Email
export async function sendSuspensionEmail(to: string, name: string) {
    try {
        const transporter = getTransporter();

        const info = await transporter.sendMail({
            from: `Sureodds <${FROM}>`,
            to,
            subject: "Your Sureodds subscription has been suspended",
            html: base(`
                ${h1("Account Suspended")}
                ${p(`Hi ${name.split(" ")[0]}, your Sureodds subscription has been suspended.`)}
                ${p("If you believe this is an error or would like to reactivate, please contact us.")}
                <div style="text-align:center;margin:24px 0">
                    <a href="${SITE}/contact" style="display:inline-block;padding:14px 32px;background:#ff6b00;color:#fff;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em">Contact Support →</a>
                </div>
            `),
        });

        console.log("✅ Suspension email sent via Nodemailer:", info.messageId);
        return { id: info.messageId };
    } catch (error) {
        console.error("❌ Failed to send suspension email:", error);
        throw error;
    }
}

// Send Welcome Email (for subscribers)
export async function sendWelcomeEmail(to: string, name: string) {
    try {
        const transporter = getTransporter();

        const info = await transporter.sendMail({
            from: `Sureodds <${FROM}>`,
            to,
            subject: "Welcome to Sureodds — Complete Your Payment",
            html: base(`
                ${h1(`Welcome, ${name.split(" ")[0]}!`)}
                ${p("Your account has been created. Complete your payment to activate your subscription and unlock the members dashboard.")}
                ${p("Once your payment is confirmed by our admin, you'll receive an email with instant access to your dashboard.")}
                <div style="text-align:center;margin:24px 0">
                    <a href="${SITE}/subscribe" style="display:inline-block;padding:14px 32px;background:#ff6b00;color:#fff;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em">Complete Payment →</a>
                </div>
                <hr style="border:none;border-top:1px solid #e8ebed;margin:28px 0">
                ${p('<span style="font-size:13px;color:#68676d">After payment approval, you\'ll receive a magic link to access your dashboard instantly.</span>')}
            `),
        });

        console.log("✅ Welcome email sent via Nodemailer:", info.messageId);
        return { id: info.messageId };
    } catch (error) {
        console.error("❌ Failed to send welcome email:", error);
        throw error;
    }
}

// Send New User Notification to Admin
export async function sendNewUserNotificationToAdmin(user: { name: string; email: string; role: string }) {
    const ADMIN = process.env.ADMIN_EMAIL ?? "admin@sureodds.ng";
    const isPunter = user.role === "punter";

    try {
        const transporter = getTransporter();

        const info = await transporter.sendMail({
            from: `Sureodds <${FROM}>`,
            to: ADMIN,
            subject: isPunter ? `New Punter Registration — ${user.name}` : `New Subscriber Registration — ${user.name}`,
            html: base(`
                ${badge(isPunter ? "Punter Registration" : "Subscriber Registration", isPunter ? "#1a1f71" : "#ff6b00")}
                <br><br>
                ${h1("New User Awaiting Approval")}
                ${p(`<strong>${user.name}</strong> (${user.email}) has registered as a ${isPunter ? "punter" : "subscriber"} and is awaiting approval.`)}
                <table style="width:100%;border-collapse:collapse;margin:16px 0 24px">
                    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#68676d;width:140px">Name</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:700;color:#1a1a1a">${user.name}</td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#68676d">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:700;color:#1a1a1a">${user.email}</td></tr>
                    <tr><td style="padding:10px 0;font-size:14px;color:#68676d">Account Type</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#1a1a1a">${isPunter ? "Punter / Tipster" : "Subscriber"}</td></tr>
                </table>
                ${p(isPunter
                ? "Once approved, this punter will be able to post predictions and blog articles."
                : "Once approved, this subscriber will need to complete payment to access predictions."
            )}
                <div style="text-align:center;margin:24px 0">
                    <a href="${SITE}/admin-dashboard/users" style="display:inline-block;padding:14px 32px;background:#1a1a1a;color:#fff;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em">Review & Approve →</a>
                </div>
            `),
        });

        console.log("✅ Admin notification sent via Nodemailer:", info.messageId);
        return { id: info.messageId };
    } catch (error) {
        console.error("❌ Failed to send admin notification:", error);
        throw error;
    }
}
