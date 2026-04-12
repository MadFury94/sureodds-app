import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { verifyUserToken } from "@/lib/auth";

const TIPS_FILE = path.join(process.cwd(), "src/data/tips.json");

function readTips() {
    try {
        return JSON.parse(readFileSync(TIPS_FILE, "utf-8"));
    } catch {
        return [];
    }
}

function writeTips(tips: unknown[]) {
    writeFileSync(TIPS_FILE, JSON.stringify(tips, null, 2));
}

async function isAuthorized(req: NextRequest): Promise<boolean> {
    const adminRaw = req.cookies.get("so_admin_session")?.value;
    if (adminRaw) {
        try { if (JSON.parse(adminRaw)?.token) return true; } catch { /* */ }
    }
    const userToken = req.cookies.get("so_user_session")?.value;
    if (userToken) {
        const payload = await verifyUserToken(userToken);
        if (payload?.role === "punter" || payload?.role === "tips-admin") return true;
    }
    return false;
}

export async function POST(req: NextRequest) {
    if (!(await isAuthorized(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { ids } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Invalid ids array" }, { status: 400 });
        }

        const tips = readTips();
        const idsToDelete = ids.map(id => parseInt(id.toString()));
        const filtered = tips.filter((t: { id: number }) => !idsToDelete.includes(t.id));

        const deletedCount = tips.length - filtered.length;

        if (deletedCount === 0) {
            return NextResponse.json({ error: "No predictions found" }, { status: 404 });
        }

        writeTips(filtered);

        return NextResponse.json({
            success: true,
            deletedCount,
            message: `${deletedCount} prediction(s) deleted successfully`
        });
    } catch (error) {
        console.error("Bulk delete error:", error);
        return NextResponse.json({ error: "Failed to delete predictions" }, { status: 500 });
    }
}
