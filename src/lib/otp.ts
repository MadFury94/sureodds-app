// OTP Management using WordPress Transients API
// Works on Vercel by storing OTPs temporarily in WordPress database

const WP_BASE = process.env.NEXT_PUBLIC_WP_API?.replace("/wp/v2", "") ?? "https://cms.sureodds.ng/wp-json";

interface OTPEntry {
    code: string;
    email: string;
    purpose: "login" | "register";
    userData?: {
        name: string;
        userType: string;
    };
    attempts: number;
}

async function getAdminToken(): Promise<string> {
    const username = process.env.WP_ADMIN_USER;
    const password = process.env.WP_ADMIN_PASSWORD;

    if (!username || !password) {
        throw new Error("WordPress admin credentials not configured");
    }

    const res = await fetch(`${WP_BASE}/jwt-auth/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Failed to authenticate with WordPress");

    const data = await res.json();
    return data.token;
}

export function generateOTP(): string {
    // Use crypto.getRandomValues for cryptographically secure OTP
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(100000 + (array[0] % 900000));
}

export async function storeOTP(
    email: string,
    code: string,
    purpose: "login" | "register",
    userData?: { name: string; userType: string }
): Promise<void> {
    const key = email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
    const entry: OTPEntry = {
        code,
        email: email.toLowerCase().trim(),
        purpose,
        userData,
        attempts: 0,
    };

    try {
        const token = await getAdminToken();

        const res = await fetch(`${WP_BASE}/custom/v1/otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                key: `otp_${key}`,
                value: JSON.stringify(entry),
                expiration: 300, // 5 minutes
            }),
        });

        if (!res.ok) {
            throw new Error("Failed to store OTP");
        }
    } catch (error) {
        // Log error without sensitive data
        console.error("[storeOTP] Failed to store OTP for email hash:", hashEmail(email));
        throw error;
    }
}

export async function verifyOTP(email: string, code: string): Promise<{
    valid: boolean;
    purpose?: "login" | "register";
    userData?: { name: string; userType: string };
    error?: string;
}> {
    const key = email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");

    try {
        const token = await getAdminToken();

        const res = await fetch(`${WP_BASE}/custom/v1/otp/otp_${key}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            return { valid: false, error: "No OTP found. Please request a new one." };
        }

        const data = await res.json();
        const entry: OTPEntry = JSON.parse(data.value);

        if (entry.attempts >= 3) {
            // Delete transient after max attempts
            await fetch(`${WP_BASE}/custom/v1/otp/otp_${key}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            return { valid: false, error: "Too many failed attempts. Please request a new OTP." };
        }

        // Constant-time comparison to prevent timing attacks
        const inputBuf = Buffer.from(code.padEnd(6, "0"));
        const storedBuf = Buffer.from(entry.code.padEnd(6, "0"));
        const codesMatch = inputBuf.length === storedBuf.length &&
            require("crypto").timingSafeEqual(inputBuf, storedBuf);

        if (!codesMatch) {
            // Increment attempts
            entry.attempts++;
            await fetch(`${WP_BASE}/custom/v1/otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    key: `otp_${key}`,
                    value: JSON.stringify(entry),
                    expiration: 300,
                }),
            });
            return { valid: false, error: "Invalid OTP code. Please try again." };
        }

        // Valid — delete transient immediately (one-time use)
        await fetch(`${WP_BASE}/custom/v1/otp/otp_${key}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        return {
            valid: true,
            purpose: entry.purpose,
            userData: entry.userData,
        };
    } catch (error) {
        console.error("[verifyOTP] Verification error for email hash:", hashEmail(email));
        return { valid: false, error: "Verification failed. Please try again." };
    }
}

export async function hasRecentOTP(_email: string): Promise<boolean> {
    return false;
}

// One-way hash for safe logging — never log raw emails
function hashEmail(email: string): string {
    return require("crypto")
        .createHash("sha256")
        .update(email.toLowerCase().trim())
        .digest("hex")
        .slice(0, 8);
}
