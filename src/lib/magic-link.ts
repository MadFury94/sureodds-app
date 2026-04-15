// Magic Link Management - Stateless version for Vercel
// Encodes user data directly in the token (no file storage needed)

import { findUserByEmail } from "./auth-wordpress";

// Create a magic link token with embedded data
export function createMagicLink(email: string, role: string): string {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Encode data in the token itself
    const data = JSON.stringify({
        email: email.toLowerCase().trim(),
        role,
        expiresAt,
        nonce: Math.random().toString(36).slice(2),
    });

    const token = Buffer.from(data).toString('base64url');

    console.log("🔗 [createMagicLink] Created magic link:", {
        email,
        role,
        tokenPreview: token.substring(0, 20) + "...",
    });

    return token;
}

// Verify magic link token
export async function verifyMagicLink(token: string): Promise<{
    valid: boolean;
    email?: string;
    role?: string;
    error?: string;
}> {
    try {
        console.log("🔍 [verifyMagicLink] Verifying token:", token.substring(0, 20) + "...");

        // Decode the token
        const data = JSON.parse(Buffer.from(token, 'base64url').toString());
        const { email, role, expiresAt } = data;

        console.log("🔍 [verifyMagicLink] Decoded data:", { email, role, expiresAt });

        // Check expiry
        if (Date.now() > expiresAt) {
            console.log("❌ [verifyMagicLink] Token expired");
            return { valid: false, error: "Magic link has expired. Please contact admin." };
        }

        // Verify user exists in WordPress
        const user = await findUserByEmail(email);
        if (!user) {
            console.log("❌ [verifyMagicLink] User not found");
            return { valid: false, error: "User not found." };
        }

        console.log("✅ [verifyMagicLink] Token valid for user:", email);

        return {
            valid: true,
            email,
            role,
        };
    } catch (error) {
        console.error("❌ [verifyMagicLink] Error:", error);
        return { valid: false, error: "Invalid magic link." };
    }
}
