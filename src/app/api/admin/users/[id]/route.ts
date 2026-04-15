import { NextRequest, NextResponse } from "next/server";
import { updateUser, toSafeUser, findUserByEmail } from "@/lib/auth-wordpress";
import { readSettings } from "@/lib/settings";
import { sendApprovalEmailWithMagicLink, sendSuspensionEmail } from "@/lib/email-nodemailer";
import { createMagicLink } from "@/lib/magic-link";
import { promises as fs } from "fs";
import path from "path";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

// Helper function to delete user's content from JSON files
async function deleteUserContent(userId: string, userEmail: string) {
    console.log("🗑️ [deleteUserContent] Deleting content for user:", userId, userEmail);

    // Delete bet codes
    try {
        const betCodesFile = path.join(process.cwd(), "src/data/bet-codes.json");
        const betCodesRaw = await fs.readFile(betCodesFile, "utf-8");
        const betCodes = JSON.parse(betCodesRaw);
        const filteredBetCodes = betCodes.filter((bc: any) => bc.createdBy !== userId && bc.createdBy !== userEmail);
        await fs.writeFile(betCodesFile, JSON.stringify(filteredBetCodes, null, 2));
        console.log("🗑️ [deleteUserContent] Deleted", betCodes.length - filteredBetCodes.length, "bet codes");
    } catch (error) {
        console.error("❌ [deleteUserContent] Error deleting bet codes:", error);
    }

    // Delete tips
    try {
        const tipsFile = path.join(process.cwd(), "src/data/tips.json");
        const tipsRaw = await fs.readFile(tipsFile, "utf-8");
        const tips = JSON.parse(tipsRaw);
        const filteredTips = tips.filter((tip: any) => {
            const createdById = tip.createdBy?.id || tip.createdBy;
            const createdByEmail = tip.createdBy?.email;
            return createdById !== userId && createdById !== userEmail && createdByEmail !== userEmail;
        });
        await fs.writeFile(tipsFile, JSON.stringify(filteredTips, null, 2));
        console.log("🗑️ [deleteUserContent] Deleted", tips.length - filteredTips.length, "tips");
    } catch (error) {
        console.error("❌ [deleteUserContent] Error deleting tips:", error);
    }

    // Delete betslips
    try {
        const betslipsFile = path.join(process.cwd(), "src/data/betslips.json");
        const betslipsRaw = await fs.readFile(betslipsFile, "utf-8");
        const betslips = JSON.parse(betslipsRaw);
        const filteredBetslips = betslips.filter((bs: any) => {
            const createdById = bs.createdBy?.id || bs.createdBy;
            const createdByEmail = bs.createdBy?.email;
            return createdById !== userId && createdById !== userEmail && createdByEmail !== userEmail;
        });
        await fs.writeFile(betslipsFile, JSON.stringify(filteredBetslips, null, 2));
        console.log("🗑️ [deleteUserContent] Deleted", betslips.length - filteredBetslips.length, "betslips");
    } catch (error) {
        console.error("❌ [deleteUserContent] Error deleting betslips:", error);
    }
}

// Approve subscriber
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const { action, email } = await req.json(); // "approve" | "suspend", need email to find user

    // WordPress uses numeric IDs, but we need to find user by email or ID
    // For now, we'll need the email passed from frontend
    const user = await findUserByEmail(email);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (action === "approve") {
        const settings = await readSettings();

        // Punters don't need subscription expiry, subscribers do
        const isPunter = user.role === "punter";
        const expiry = isPunter ? null : new Date();
        if (expiry) {
            expiry.setDate(expiry.getDate() + settings.subscriptionDurationDays);
        }

        const updated = await updateUser(id, {
            status: "active",
            subscriptionExpiry: expiry ? expiry.toISOString() : null,
            approvedAt: new Date().toISOString(),
            approvedBy: "admin",
        });

        // Generate magic link for one-time dashboard access
        const magicToken = createMagicLink(user.email, user.role);

        // Notify user with role-specific email and magic link
        sendApprovalEmailWithMagicLink(
            user.email,
            user.name,
            user.role as "punter" | "subscriber",
            magicToken,
            expiry ? expiry.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined
        );

        return NextResponse.json({ user: toSafeUser(updated!) });
    }

    if (action === "suspend") {
        const updated = await updateUser(id, { status: "suspended" });
        // Notify user
        sendSuspensionEmail(user.email, user.name);
        return NextResponse.json({ user: toSafeUser(updated!) });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

// Delete user - WordPress API will handle this
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;

    try {
        console.log("🗑️ [DELETE] Attempting to delete user:", id);

        // First, get user info to delete their content
        const user = await findUserByEmail(""); // We need to get user by ID, but let's get from request body

        // Get user email from request body if provided
        const body = await req.json().catch(() => ({}));
        const userEmail = body.email;

        if (userEmail) {
            const userToDelete = await findUserByEmail(userEmail);
            if (userToDelete) {
                // Delete all user content from JSON files
                await deleteUserContent(userToDelete.id, userToDelete.email);
            }
        } else {
            // If no email provided, try to delete by ID only
            await deleteUserContent(id, "");
        }

        // Get admin token
        const WP_JWT_BASE = "https://sureodds.ng/wp-json";
        const WP_API = process.env.NEXT_PUBLIC_WP_API ?? "https://sureodds.ng/wp-json/wp/v2";

        const username = process.env.WP_ADMIN_USER;
        const password = process.env.WP_ADMIN_PASSWORD;

        if (!username || !password) {
            throw new Error("WordPress admin credentials not configured");
        }

        // Get JWT token
        const tokenRes = await fetch(`${WP_JWT_BASE}/jwt-auth/v1/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!tokenRes.ok) {
            throw new Error("Failed to authenticate with WordPress");
        }

        const tokenData = await tokenRes.json();
        const token = tokenData.token;

        // First, get the admin user ID to reassign content
        const adminRes = await fetch(`${WP_API}/users?search=${encodeURIComponent(username)}&context=edit`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        let reassignId = 1; // Default to user ID 1 (usually the main admin)
        if (adminRes.ok) {
            const adminUsers = await adminRes.json();
            if (adminUsers.length > 0) {
                reassignId = adminUsers[0].id;
            }
        }

        console.log("🗑️ [DELETE] Will reassign WordPress content to user ID:", reassignId);

        // Delete user via WordPress API
        // force=true permanently deletes the user
        // reassign parameter reassigns their WordPress content to another user
        const deleteRes = await fetch(`${WP_API}/users/${id}?force=true&reassign=${reassignId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("🗑️ [DELETE] WordPress API response status:", deleteRes.status);

        if (!deleteRes.ok) {
            const errorText = await deleteRes.text();
            console.error("❌ [DELETE] WordPress API error:", errorText);

            // Try to parse the error response
            let errorMessage = "Failed to delete user from WordPress.";
            try {
                const errorJson = JSON.parse(errorText);
                console.error("❌ [DELETE] Error details:", errorJson);

                // WordPress error codes
                if (errorJson.code === "rest_user_cannot_delete") {
                    errorMessage = "You don't have permission to delete this user.";
                } else if (errorJson.code === "rest_cannot_delete") {
                    errorMessage = "Cannot delete this user. They may have published content.";
                } else if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch {
                // Not JSON, use the text as error message if it's short enough
                if (errorText.length < 200) {
                    errorMessage = errorText;
                }
            }

            // Check if it's a permission error
            if (deleteRes.status === 403) {
                return NextResponse.json({
                    error: errorMessage
                }, { status: 403 });
            }

            return NextResponse.json({
                error: errorMessage
            }, { status: 500 });
        }

        const result = await deleteRes.json();
        console.log("✅ [DELETE] User deleted successfully:", result);

        return NextResponse.json({
            success: true,
            message: "User and all their content deleted successfully."
        });

    } catch (error) {
        console.error("❌ [DELETE] Error deleting user:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Failed to delete user."
        }, { status: 500 });
    }
}
