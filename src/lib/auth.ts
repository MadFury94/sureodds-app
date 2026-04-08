import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────

export type UserRole = "subscriber" | "punter" | "tips-admin";
export type UserStatus = "pending" | "active" | "suspended";

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    status: UserStatus;
    subscriptionExpiry: string | null;
    paymentMethod: "online" | "manual" | null;
    paymentRef: string | null;
    proofUrl: string | null;
    createdAt: string;
    approvedAt: string | null;
    approvedBy: string | null;
}

export type SafeUser = Omit<User, "passwordHash">;

export interface SessionPayload {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    subscriptionExpiry: string | null;
}

// ── File path ─────────────────────────────────────────────────────────────

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

// ── User file helpers ─────────────────────────────────────────────────────

export async function readUsers(): Promise<User[]> {
    try {
        const raw = await fs.readFile(USERS_FILE, "utf-8");
        return JSON.parse(raw) as User[];
    } catch {
        return [];
    }
}

export async function writeUsers(users: User[]): Promise<void> {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const users = await readUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
    const users = await readUsers();
    return users.find(u => u.id === id) ?? null;
}

export async function createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}): Promise<User> {
    const users = await readUsers();
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const role = data.role ?? "subscriber";
    const user: User = {
        id: generateId(),
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role,
        // All users start as pending - admin must approve
        status: "pending",
        subscriptionExpiry: null,
        paymentMethod: null,
        paymentRef: null,
        proofUrl: null,
        createdAt: new Date().toISOString(),
        approvedAt: null,
        approvedBy: null,
    };

    users.push(user);
    await writeUsers(users);
    return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await readUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    await writeUsers(users);
    return users[idx];
}

export function toSafeUser(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
}

// ── Password ──────────────────────────────────────────────────────────────

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

// ── JWT ───────────────────────────────────────────────────────────────────

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

// ── Simple UUID fallback (crypto.randomUUID) ──────────────────────────────

function generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // fallback
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
