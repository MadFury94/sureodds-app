// OTP Management using WordPress Transients API
// Works on Vercel by storing OTPs temporarily in WordPress database

const WP_BASE = "https://sureodds.ng/wp-json";

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
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(
    email: string,
    code: string,
    purpose: "login" | "register",
    userData?: { name: string; userType: string }
): Promise<void> {
    const key = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const entry: OTPEntry = {
        code,
        email: email.toLowerCase().trim(),
        purpose,
        userData,
        attempts: 0,
    };

    console.log("💾 [storeOTP] BEFORE STORAGE:", {
        email,
        code,
        key: `otp_${key}`,
        timestamp: new Date().toISOString()
    });

    try {
        const token = await getAdminToken();

        // Store as WordPress transient (expires in 5 minutes)
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
            const errorText = await res.text();
            console.error("❌ [storeOTP] WordPress API error:", errorText);
            throw new Error("Failed to store OTP in WordPress");
        }

        const result = await res.json();
        console.log("✅ [storeOTP] STORED SUCCESSFULLY:", {
            email,
            code,
            key: `otp_${key}`,
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ [storeOTP] Error:", error);
        throw error;
    }
}

export async function verifyOTP(email: string, code: string): Promise<{
    valid: boolean;
    purpose?: "login" | "register";
    userData?: { name: string; userType: string };
    error?: string;
}> {
    const key = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');

    try {
        const token = await getAdminToken();

        // Get transient from WordPress
        const res = await fetch(`${WP_BASE}/custom/v1/otp/otp_${key}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            console.log("❌ [verifyOTP] No OTP found for key:", `otp_${key}`);
            return { valid: false, error: "No OTP found. Please request a new one." };
        }

        const data = await res.json();
        const entry: OTPEntry = JSON.parse(data.value);

        console.log("🔍 [verifyOTP] Found OTP:", {
            email,
            key: `otp_${key}`,
            storedCode: entry.code,
            inputCode: code,
            attempts: entry.attempts
        });

        if (entry.attempts >= 3) {
            console.log("❌ [verifyOTP] Too many attempts");
            // Delete transient
            await fetch(`${WP_BASE}/custom/v1/otp/otp_${key}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            return { valid: false, error: "Too many failed attempts. Please request a new OTP." };
        }

        if (entry.code !== code) {
            console.log("❌ [verifyOTP] Invalid code");
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

        // Valid - delete transient
        await fetch(`${WP_BASE}/custom/v1/otp/otp_${key}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ [verifyOTP] OTP verified successfully");

        return {
            valid: true,
            purpose: entry.purpose,
            userData: entry.userData,
        };
    } catch (error) {
        console.error("❌ [verifyOTP] Error:", error);
        return { valid: false, error: "Verification failed. Please try again." };
    }
}

export async function hasRecentOTP(email: string): Promise<boolean> {
    // For simplicity, always return false (allow OTP requests)
    // You can implement rate limiting here if needed
    return false;
}
