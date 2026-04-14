// Magic link authentication for one-time dashboard access
// Links expire after 24 hours and can only be used once
// For development: also stores in file to survive server restarts

import { promises as fs } from "fs";
import path from "path";

interface MagicLinkData {
    email: string;
    role: string;
    createdAt: number;
    used: boolean;
}

// In-memory storage (in production, use Redis or database)
const magicLinks = new Map<string, MagicLinkData>();

// File path for development persistence
const MAGIC_LINK_FILE = path.join(process.cwd(), ".magic-links.json");

// Load magic links from file on startup (development only)
async function loadMagicLinksFromFile() {
    if (process.env.NODE_ENV !== "development") return;

    try {
        const data = await fs.readFile(MAGIC_LINK_FILE, "utf-8");
        const entries: [string, MagicLinkData][] = JSON.parse(data);

        // Only load non-expired entries
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000;
        for (const [token, data] of entries) {
            if (now - data.createdAt < maxAge && !data.used) {
                magicLinks.set(token, data);
            }
        }
        console.log("📂 Loaded", magicLinks.size, "magic links from file");
    } catch (error) {
        // File doesn't exist or is invalid - that's okay
    }
}

// Save magic links to file (development only)
async function saveMagicLinksToFile() {
    if (process.env.NODE_ENV !== "development") return;

    try {
        const entries = Array.from(magicLinks.entries());
        await fs.writeFile(MAGIC_LINK_FILE, JSON.stringify(entries, null, 2));
    } catch (error) {
        console.error("Failed to save magic links to file:", error);
    }
}

// Load on startup
loadMagicLinksFromFile();

// Generate a secure random token
function generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Create a magic link
export function createMagicLink(email: string, role: string): string {
    const token = generateToken();

    magicLinks.set(token, {
        email,
        role,
        createdAt: Date.now(),
        used: false,
    });

    console.log("🔗 Created magic link for:", email, "Token:", token.substring(0, 10) + "...");

    // Save to file in development
    saveMagicLinksToFile();

    return token;
}

// Verify and consume a magic link
export function verifyMagicLink(token: string): { valid: boolean; email?: string; role?: string; error?: string } {
    console.log("🔍 Magic Link Verification Debug:");
    console.log("  Token:", token.substring(0, 10) + "...");
    console.log("  Total links in store:", magicLinks.size);

    const data = magicLinks.get(token);

    console.log("  Data found:", data ? "Yes" : "No");
    if (data) {
        console.log("  Email:", data.email);
        console.log("  Role:", data.role);
        console.log("  Used:", data.used);
        console.log("  Age:", Math.floor((Date.now() - data.createdAt) / 1000), "seconds");
    }

    if (!data) {
        return { valid: false, error: "Invalid or expired link." };
    }

    // Check if already used
    if (data.used) {
        return { valid: false, error: "This link has already been used. Please request a new one." };
    }

    // Check if expired (24 hours)
    const age = Date.now() - data.createdAt;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (age > maxAge) {
        magicLinks.delete(token);
        return { valid: false, error: "This link has expired. Please request a new one." };
    }

    // Mark as used
    data.used = true;
    magicLinks.set(token, data);

    // Save to file in development
    saveMagicLinksToFile();

    // Clean up after 1 hour
    setTimeout(() => {
        magicLinks.delete(token);
        saveMagicLinksToFile();
    }, 60 * 60 * 1000);

    return {
        valid: true,
        email: data.email,
        role: data.role,
    };
}

// Clean up expired links (run periodically)
export function cleanupExpiredLinks() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    for (const [token, data] of magicLinks.entries()) {
        if (now - data.createdAt > maxAge) {
            magicLinks.delete(token);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredLinks, 60 * 60 * 1000);
