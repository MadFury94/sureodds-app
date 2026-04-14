// OTP Management Library
// Stores OTPs in memory with expiry (5 minutes)
// For development: also stores in file to survive server restarts

import { promises as fs } from "fs";
import path from "path";

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

// File path for development persistence
const OTP_FILE = path.join(process.cwd(), ".otp-store.json");

// Load OTPs from file on startup (development only)
async function loadOTPsFromFile() {
    if (process.env.NODE_ENV !== "development") {
        console.log("📂 [loadOTPsFromFile] Skipping - not in development mode");
        return;
    }

    try {
        console.log("📂 [loadOTPsFromFile] Loading OTPs from:", OTP_FILE);
        const data = await fs.readFile(OTP_FILE, "utf-8");
        const entries: [string, OTPEntry][] = JSON.parse(data);

        console.log("📂 [loadOTPsFromFile] Found", entries.length, "entries in file");

        // Only load non-expired entries
        const now = Date.now();
        let loadedCount = 0;
        for (const [key, entry] of entries) {
            if (now < entry.expiresAt) {
                otpStore.set(key, entry);
                loadedCount++;
                console.log("📂 [loadOTPsFromFile] Loaded OTP for:", key);
            } else {
                console.log("📂 [loadOTPsFromFile] Skipped expired OTP for:", key);
            }
        }
        console.log("✅ [loadOTPsFromFile] Loaded", loadedCount, "valid OTPs from file");
    } catch (error) {
        // File doesn't exist or is invalid - that's okay
        console.log("📂 [loadOTPsFromFile] No existing OTP file found (this is normal on first run)");
    }
}

// Save OTPs to file (development only)
async function saveOTPsToFile() {
    if (process.env.NODE_ENV !== "development") return;

    try {
        const entries = Array.from(otpStore.entries());
        await fs.writeFile(OTP_FILE, JSON.stringify(entries, null, 2));
    } catch (error) {
        console.error("Failed to save OTPs to file:", error);
    }
}

// Load on startup
loadOTPsFromFile();

// Clean up expired OTPs every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of otpStore.entries()) {
        if (now > entry.expiresAt) {
            otpStore.delete(key);
        }
    }
    saveOTPsToFile(); // Save after cleanup
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
    const key = email.toLowerCase().trim();
    otpStore.set(key, {
        code,
        email: key,
        purpose,
        userData,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0,
    });

    console.log("💾 [storeOTP] Stored OTP:");
    console.log("  Email (original):", email);
    console.log("  Email (normalized):", key);
    console.log("  Code:", code);
    console.log("  Purpose:", purpose);
    console.log("  Expires at:", new Date(Date.now() + 5 * 60 * 1000).toISOString());
    console.log("  Total OTPs in store:", otpStore.size);

    // Save to file in development
    saveOTPsToFile();
}

export function verifyOTP(email: string, code: string): {
    valid: boolean;
    purpose?: "login" | "register";
    userData?: { name: string; userType: string };
    error?: string;
} {
    const key = email.toLowerCase().trim();
    const entry = otpStore.get(key);

    console.log("🔍 OTP Verification Debug:");
    console.log("  Email (original):", email);
    console.log("  Email (normalized):", key);
    console.log("  Code entered:", code);
    console.log("  Entry found:", entry ? "Yes" : "No");
    console.log("  Total OTPs in store:", otpStore.size);
    console.log("  All stored emails:", Array.from(otpStore.keys()));

    if (entry) {
        console.log("  Stored code:", entry.code);
        console.log("  Code match:", entry.code === code);
        console.log("  Expired:", Date.now() > entry.expiresAt);
        console.log("  Expires at:", new Date(entry.expiresAt).toISOString());
        console.log("  Current time:", new Date().toISOString());
        console.log("  Attempts:", entry.attempts);
        console.log("  Purpose:", entry.purpose);
    }

    if (!entry) {
        console.log("❌ No OTP entry found for:", key);
        return { valid: false, error: "No OTP found. Please request a new one." };
    }

    if (Date.now() > entry.expiresAt) {
        console.log("❌ OTP expired for:", key);
        otpStore.delete(key);
        saveOTPsToFile();
        return { valid: false, error: "OTP has expired. Please request a new one." };
    }

    if (entry.attempts >= 3) {
        console.log("❌ Too many attempts for:", key);
        otpStore.delete(key);
        saveOTPsToFile();
        return { valid: false, error: "Too many failed attempts. Please request a new OTP." };
    }

    if (entry.code !== code) {
        console.log("❌ Invalid code for:", key, "- Expected:", entry.code, "Got:", code);
        entry.attempts++;
        saveOTPsToFile();
        return { valid: false, error: "Invalid OTP code. Please try again." };
    }

    // Valid OTP - remove from store
    console.log("✅ OTP verified successfully for:", key);
    otpStore.delete(key);
    saveOTPsToFile();
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
