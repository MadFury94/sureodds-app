/**
 * POST /api/video/webhook
 *
 * Receives WordPress publish events and queues a video render job.
 *
 * WordPress fires this via a custom plugin or WP Webhooks plugin:
 *   Action: publish_post
 *   URL: https://sureodds.ng/api/video/webhook
 *   Method: POST
 *   Headers: { "x-webhook-secret": <WEBHOOK_SECRET> }
 *   Body: { post_id, post_slug, post_title, post_status, ... }
 *
 * Returns 200 immediately — never blocks WordPress.
 */

import { NextRequest, NextResponse } from "next/server";
import { getQueue, type VideoJobInput } from "@/lib/video-queue";

const WEBHOOK_SECRET = process.env.VIDEO_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
    // ── Auth ─────────────────────────────────────────────────────────────
    const secret = req.headers.get("x-webhook-secret");
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // ── Only process published posts ─────────────────────────────────────
    const status = body.post_status ?? body.status;
    if (status !== "publish") {
        return NextResponse.json({ skipped: true, reason: "not published" });
    }

    const slug = String(body.post_slug ?? body.slug ?? "");
    const title = String(body.post_title ?? body.title ?? "");
    const image = String(body.featured_image ?? body.image ?? "");
    const category = String(body.category ?? "Football");
    const excerpt = String(body.excerpt ?? "");
    const date = String(body.date ?? new Date().toISOString());

    if (!slug || !title) {
        return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
    }

    const input: VideoJobInput = { slug, title, image, category, excerpt, date };
    const job = await getQueue().enqueue(input);

    console.log(`[video/webhook] queued job ${job.id} for slug: ${slug}`);

    return NextResponse.json({ queued: true, jobId: job.id });
}
