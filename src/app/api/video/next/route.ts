/**
 * GET /api/video/next
 *
 * The Railway worker polls this endpoint to pick up the next queued job.
 * Returns the job and marks it as "rendering" atomically.
 *
 * Protected by WORKER_SECRET header.
 *
 * Returns 204 when the queue is empty — worker should back off and retry.
 */

import { NextRequest, NextResponse } from "next/server";
import { getQueue } from "@/lib/video-queue";

const WORKER_SECRET = process.env.VIDEO_WORKER_SECRET ?? "";

export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-worker-secret");
    if (!WORKER_SECRET || secret !== WORKER_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await getQueue().nextQueued();

    if (!job) {
        // No work available — worker should sleep and retry
        return new NextResponse(null, { status: 204 });
    }

    // Mark as rendering immediately to prevent double-pickup
    const updated = await getQueue().updateJob(job.id, {
        status: "rendering",
        startedAt: new Date().toISOString(),
        attempts: job.attempts + 1,
    });

    return NextResponse.json(updated);
}
