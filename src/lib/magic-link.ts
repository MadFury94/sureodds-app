// Magic Link Management — HMAC-signed tokens (tamper-proof)
import { createHmac, timingSafeEqual } from "crypto";
import { findUserByEmail } from "./auth-wordpress";

function getSecret(): string {
    const s = process.env.JWT_SECRET;
    if (!s || s.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
    return s;
}

function sign(payload: string): string {
    return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

// Create a signed magic link token
export function createMagicLink(email: string, role: string): string {
    const data = JSON.stringify({
        email: email.toLowerCase().trim(),
        role,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        nonce: crypto.randomUUID(),
    });
    const payload = Buffer.from(data).toString("base64url");
    const sig = sign(payload);
    return `${payload}.${sig}`;
}

// Verify a signed magic link token
export async function verifyMagicLink(token: string): Promise<{
    valid: boolean;
    email?: string;
    role?: string;
    error?: string;
}> {
    try {
        const dotIdx = token.lastIndexOf(".");
        if (dotIdx === -1) return { valid: false, error: "Invalid magic link." };

        const payload = token.slice(0, dotIdx);
        const sig = token.slice(dotIdx + 1);

        // Constant-time signature comparison to prevent timing attacks
        const expectedSig = sign(payload);
        const sigBuf = Buffer.from(sig, "base64url");
        const expectedBuf = Buffer.from(expectedSig, "base64url");
        if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
            return { valid: false, error: "Invalid magic link." };
        }

        const data = JSON.parse(Buffer.from(payload, "base64url").toString());
        const { email, role, expiresAt } = data;

        if (Date.now() > expiresAt) {
            return { valid: false, error: "Magic link has expired. Please contact admin." };
        }

        const user = await findUserByEmail(email);
        if (!user) return { valid: false, error: "User not found." };

        return { valid: true, email, role };
    } catch {
        return { valid: false, error: "Invalid magic link." };
    }
}
