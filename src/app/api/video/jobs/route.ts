/**
 * GET /api/video/jobs
 *
 * Admin dashboard — list recent video jobs with their status.
 * Protected by admin session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getQueue } from "@/lib/video-queue";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

export async function GET(req: NextRequest) {
    if (!isAdminAuthed(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await getQueue().listJobs(50);
    return NextResponse.json(jobs);
}
