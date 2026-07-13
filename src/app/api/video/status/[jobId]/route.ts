/**
 * GET /api/video/status/[jobId]
 *
 * Poll job status from the admin dashboard.
 * Returns current job state including videoUrl when done.
 *
 * PATCH /api/video/status/[jobId]
 *
 * Called by the Railway worker to update job state.
 * Protected by WORKER_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server";
import { getQueue } from "@/lib/video-queue";

const WORKER_SECRET = process.env.VIDEO_WORKER_SECRET ?? "";

// ── GET — read job status ─────────────────────────────────────────────────
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const { jobId } = await params;
    const job = await getQueue().getJob(jobId);

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
}

// ── PATCH — worker updates job ────────────────────────────────────────────
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    // Only the Railway worker can update jobs
    const secret = req.headers.get("x-worker-secret");
    if (!WORKER_SECRET || secret !== WORKER_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;

    let patch: Record<string, unknown>;
    try {
        patch = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const updated = await getQueue().updateJob(jobId, patch as never);

    if (!updated) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
}
