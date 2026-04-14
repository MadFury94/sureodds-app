// WordPress-based user authentication and storage
// Uses WordPress REST API to manage users

const WP_API = process.env.NEXT_PUBLIC_WP_API ?? "https://sureodds.ng/wp-json/wp/v2";
const WP_JWT_BASE = "https://sureodds.ng/wp-json";

export type UserRole = "subscriber" | "punter" | "tips-admin";
export type UserStatus = "pending" | "active" | "suspended";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    subscriptionExpiry: string | null;
    createdAt: string;
    approvedAt: string | null;
    approvedBy: string | null;
}

export type SafeUser = User;

export interface SessionPayload {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    subscriptionExpiry: string | null;
}

// Map WordPress roles to our app roles
function mapWordPressRole(wpRoles: string[] | undefined): UserRole {
    if (!wpRoles || !Array.isArray(wpRoles)) return "subscriber";
    if (wpRoles.includes("punter")) return "punter";
    if (wpRoles.includes("tips_admin")) return "tips-admin";
    // Existing WordPress users with elevated roles (author, editor, admin) get tips-admin access
    if (wpRoles.includes("administrator") || wpRoles.includes("editor") || wpRoles.includes("author")) {
        return "tips-admin";
    }
    return "subscriber";
}

// Get WordPress admin credentials from environment
function getAdminAuth() {
    const username = process.env.WP_ADMIN_USER;
    const password = process.env.WP_ADMIN_PASSWORD;

    if (!username || !password) {
        throw new Error("WordPress admin credentials not configured");
    }

    return { username, password };
}

// Get admin JWT token
async function getAdminToken(): Promise<string> {
    const { username, password } = getAdminAuth();

    const res = await fetch(`${WP_JWT_BASE}/jwt-auth/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        throw new Error("Failed to authenticate with WordPress");
    }

    const data = await res.json();
    return data.token;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
    try {
        const token = await getAdminToken();

        // Add cache-busting timestamp
        const timestamp = Date.now();
        const res = await fetch(`${WP_API}/users?search=${encodeURIComponent(email)}&context=edit&_=${timestamp}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
            },
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const users = await res.json();
        if (users.length === 0) return null;

        const wpUser = users[0];
        const role = mapWordPressRole(wpUser.roles);

        // Check meta.user_status first
        let status: UserStatus = "pending";

        if (wpUser.meta?.user_status) {
            // Use the explicit user_status meta field
            status = wpUser.meta.user_status as UserStatus;
        } else if (wpUser.roles?.includes("administrator") || wpUser.roles?.includes("editor") || wpUser.roles?.includes("author")) {
            // Existing WordPress users with elevated roles are automatically active
            status = "active";
        } else if (wpUser.roles?.includes("subscriber") && !wpUser.meta?.user_status) {
            // Existing subscribers without explicit status are active (legacy users)
            status = "active";
        } else {
            // New users default to pending
            status = "pending";
        }

        return {
            id: wpUser.id.toString(),
            name: wpUser.name,
            email: wpUser.email,
            role,
            status,
            subscriptionExpiry: wpUser.meta?.subscription_expiry || null,
            createdAt: wpUser.registered_date,
            approvedAt: wpUser.meta?.approved_at || null,
            approvedBy: wpUser.meta?.approved_by || null,
        };
    } catch (error) {
        console.error("Error finding user:", error);
        return null;
    }
}

// Create new user
export async function createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}): Promise<User> {
    try {
        const token = await getAdminToken();

        // Map our roles to WordPress roles
        const wpRole = data.role === "punter" ? "punter" : "subscriber";

        const res = await fetch(`${WP_API}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                username: data.email.split("@")[0] + Date.now(), // Unique username
                email: data.email,
                name: data.name,
                password: data.password,
                roles: [wpRole],
                meta: {
                    user_status: "pending",
                    subscription_expiry: null,
                },
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            if (error.code === "existing_user_email") {
                throw new Error("Email already registered");
            }
            throw new Error(error.message || "Failed to create user");
        }

        const wpUser = await res.json();

        return {
            id: wpUser.id.toString(),
            name: wpUser.name,
            email: wpUser.email,
            role: data.role || "subscriber",
            status: "pending",
            subscriptionExpiry: null,
            createdAt: new Date().toISOString(),
            approvedAt: null,
            approvedBy: null,
        };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

// Update user
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
        const token = await getAdminToken();

        console.log("📝 [updateUser] Updating WordPress user:", id);
        console.log("📝 [updateUser] Updates:", JSON.stringify(updates, null, 2));

        // Build the update payload
        const updatePayload: any = {};

        // Update name if provided
        if (updates.name) {
            updatePayload.name = updates.name;
        }

        // Update meta fields
        updatePayload.meta = {};

        if (updates.status !== undefined) {
            updatePayload.meta.user_status = updates.status;
            console.log("📝 [updateUser] Setting user_status to:", updates.status);
        }

        if (updates.subscriptionExpiry !== undefined) {
            updatePayload.meta.subscription_expiry = updates.subscriptionExpiry;
            console.log("📝 [updateUser] Setting subscription_expiry to:", updates.subscriptionExpiry);
        }

        if (updates.approvedAt !== undefined) {
            updatePayload.meta.approved_at = updates.approvedAt;
            console.log("📝 [updateUser] Setting approved_at to:", updates.approvedAt);
        }

        if (updates.approvedBy !== undefined) {
            updatePayload.meta.approved_by = updates.approvedBy;
            console.log("📝 [updateUser] Setting approved_by to:", updates.approvedBy);
        }

        console.log("📝 [updateUser] Request payload:", JSON.stringify(updatePayload, null, 2));

        const res = await fetch(`${WP_API}/users/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
        });

        console.log("📝 [updateUser] Response status:", res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ [updateUser] WordPress API error:", errorText);
            return null;
        }

        const wpUser = await res.json();
        console.log("✅ [updateUser] WordPress response:", {
            id: wpUser.id,
            name: wpUser.name,
            email: wpUser.email,
            meta: wpUser.meta,
        });

        // Return the updated user with the values we just set
        // Don't rely on WordPress response meta, use our updates directly
        const updatedUser: User = {
            id: wpUser.id.toString(),
            name: wpUser.name,
            email: wpUser.email,
            role: mapWordPressRole(wpUser.roles),
            status: updates.status ?? wpUser.meta?.user_status ?? "pending",
            subscriptionExpiry: updates.subscriptionExpiry ?? wpUser.meta?.subscription_expiry ?? null,
            createdAt: wpUser.registered_date,
            approvedAt: updates.approvedAt ?? wpUser.meta?.approved_at ?? null,
            approvedBy: updates.approvedBy ?? wpUser.meta?.approved_by ?? null,
        };

        console.log("✅ [updateUser] Returning user:", JSON.stringify(updatedUser, null, 2));

        return updatedUser;
    } catch (error) {
        console.error("❌ [updateUser] Error updating user:", error);
        return null;
    }
}

// Read all users
export async function readUsers(): Promise<User[]> {
    try {
        const token = await getAdminToken();

        console.log("📋 [readUsers] Fetching all users from WordPress...");

        // Add cache-busting timestamp
        const timestamp = Date.now();
        const res = await fetch(`${WP_API}/users?per_page=100&context=edit&_=${timestamp}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error("❌ [readUsers] WordPress API error:", res.status, res.statusText);
            return [];
        }

        const wpUsers = await res.json();
        console.log("📋 [readUsers] WordPress returned", wpUsers.length, "users");

        return wpUsers.map((wpUser: any) => {
            const role = mapWordPressRole(wpUser.roles);

            // Check meta.user_status first
            let status: UserStatus = "pending";

            if (wpUser.meta?.user_status) {
                // Use the explicit user_status meta field
                status = wpUser.meta.user_status as UserStatus;
                console.log(`📋 [readUsers] User ${wpUser.email}: Using meta.user_status = ${status}`);
            } else if (wpUser.roles?.includes("administrator") || wpUser.roles?.includes("editor") || wpUser.roles?.includes("author")) {
                // Existing WordPress users with elevated roles are automatically active
                status = "active";
                console.log(`📋 [readUsers] User ${wpUser.email}: Elevated role, auto-active`);
            } else if (wpUser.roles?.includes("subscriber") && !wpUser.meta?.user_status) {
                // Existing subscribers without explicit status are active (legacy users)
                status = "active";
                console.log(`📋 [readUsers] User ${wpUser.email}: Legacy subscriber, auto-active`);
            } else {
                // New users default to pending
                status = "pending";
                console.log(`📋 [readUsers] User ${wpUser.email}: No status found, defaulting to pending`);
            }

            console.log(`📋 [readUsers] User ${wpUser.email}:`, {
                id: wpUser.id,
                roles: wpUser.roles,
                mappedRole: role,
                metaStatus: wpUser.meta?.user_status,
                finalStatus: status,
            });

            return {
                id: wpUser.id.toString(),
                name: wpUser.name,
                email: wpUser.email,
                role,
                status,
                subscriptionExpiry: wpUser.meta?.subscription_expiry || null,
                createdAt: wpUser.registered_date || new Date().toISOString(),
                approvedAt: wpUser.meta?.approved_at || null,
                approvedBy: wpUser.meta?.approved_by || null,
            };
        });
    } catch (error) {
        console.error("❌ [readUsers] Error reading users:", error);
        return [];
    }
}

export function toSafeUser(user: User): SafeUser {
    return user;
}

// JWT functions (keep existing implementation)
import { SignJWT, jwtVerify } from "jose";

function getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
    return new TextEncoder().encode(secret);
}

export async function signUserToken(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getSecret());
}

export async function verifyUserToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}
