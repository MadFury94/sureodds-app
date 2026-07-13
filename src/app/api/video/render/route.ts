/**
 * POST /api/video/render
 *
 * Manual trigger — admin dashboard "Generate Video" button calls this.
 * Accepts full article data directly, queues the job, and returns the job ID.
 *
 * The Railway worker polls /api/video/next to pick up jobs.
 * This endpoint does NOT render — it only enqueues.
 *
 * Protected: requires admin session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getQueue, type VideoJobInput } from "@/lib/video-queue";

function isAdminAuthed(req: NextRequest): boolean {
    const session = req.cookies.get("so_admin_session")?.value;
    if (!session) return false;
    try { return !!JSON.parse(session)?.token; } catch { return false; }
}

export async function POST(req: NextRequest) {
    if (!isAdminAuthed(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Partial<VideoJobInput>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { slug, title, image, category, excerpt, date } = body;

    if (!slug || !title) {
        return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
    }

    const input: VideoJobInput = {
        slug,
        title,
        image: image ?? "",
        category: category ?? "Football",
        excerpt: excerpt ?? "",
        date: date ?? new Date().toISOString(),
    };

    const job = await getQueue().enqueue(input);

    console.log(`[video/render] manual job ${job.id} queued for slug: ${slug}`);

    return NextResponse.json({ queued: true, jobId: job.id, job });
}
