// OTP Management Library
// Stores OTPs in memory with expiry (5 minutes)

interface OTPEntry {
    code: string;
    email: string;
    purpose: "login" | "register";
    userData?: {
        name: string;
        userType: string;
    };
    expiresAt: number;
    attempts: number;
}

// In-memory store (for production, use Redis or database)
const otpStore = new Map<string, OTPEntry>();

// Clean up expired OTPs every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of otpStore.entries()) {
        if (now > entry.expiresAt) {
            otpStore.delete(key);
        }
    }
}, 60000);

export function generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(
    email: string,
    code: string,
    purpose: "login" | "register",
    userData?: { name: string; userType: string }
): void {
    const key = email.toLowerCase();
    otpStore.set(key, {
        code,
        email: key,
        purpose,
        userData,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0,
    });
}

export function verifyOTP(email: string, code: string): {
    valid: boolean;
    purpose?: "login" | "register";
    userData?: { name: string; userType: string };
    error?: string;
} {
    const key = email.toLowerCase();
    const entry = otpStore.get(key);

    if (!entry) {
        return { valid: false, error: "No OTP found. Please request a new one." };
    }

    if (Date.now() > entry.expiresAt) {
        otpStore.delete(key);
        return { valid: false, error: "OTP has expired. Please request a new one." };
    }

    if (entry.attempts >= 3) {
        otpStore.delete(key);
        return { valid: false, error: "Too many failed attempts. Please request a new OTP." };
    }

    if (entry.code !== code) {
        entry.attempts++;
        return { valid: false, error: "Invalid OTP code. Please try again." };
    }

    // Valid OTP - remove from store
    otpStore.delete(key);
    return {
        valid: true,
        purpose: entry.purpose,
        userData: entry.userData,
    };
}

export function hasRecentOTP(email: string): boolean {
    const key = email.toLowerCase();
    const entry = otpStore.get(key);
    if (!entry) return false;

    // Check if OTP was created in the last 60 seconds
    const createdAt = entry.expiresAt - 5 * 60 * 1000;
    return Date.now() - createdAt < 60000;
}
