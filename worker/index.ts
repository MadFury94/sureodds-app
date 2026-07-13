/**
 * Sureodds Video Render Worker
 *
 * Runs as a standalone Node.js process on Railway (or any VPS).
 * Polls the Next.js app for queued jobs, renders with Remotion,
 * uploads to Cloudflare R2, then reports completion back.
 *
 * Environment variables required:
 *   NEXTJS_APP_URL       — https://sureodds.ng
 *   VIDEO_WORKER_SECRET  — shared secret for API auth
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 *   R2_PUBLIC_URL        — https://videos.sureodds.ng
 */

import path from "path";
import os from "os";
import fs from "fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ── Config ────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXTJS_APP_URL ?? "https://sureodds.ng";
const WORKER_SECRET = process.env.VIDEO_WORKER_SECRET ?? "";
const POLL_INTERVAL = 10_000; // ms between polls when queue is empty
const RETRY_INTERVAL = 3_000; // ms between polls when queue has work

const workerHeaders = {
    "x-worker-secret": WORKER_SECRET,
    "Content-Type": "application/json",
};

// ── R2 client ─────────────────────────────────────────────────────────────

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
    requestChecksumCalculation: "WHEN_REQUIRED" as never,
    responseChecksumValidation: "WHEN_REQUIRED" as never,
});

async function uploadFile(key: string, filePath: string, contentType: string): Promise<string> {
    const body = await fs.readFile(filePath);
    await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME ?? "",
        Key: key,
        Body: body,
        ContentType: contentType,
    }));
    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
    return `${publicUrl}/${key}`;
}

// ── R2 key builder ────────────────────────────────────────────────────────

function buildKeys(slug: string) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const safe = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    return {
        videoKey: `videos/${yyyy}/${mm}/${safe}.mp4`,
        thumbnailKey: `thumbnails/${yyyy}/${mm}/${safe}.jpg`,
    };
}

// ── Job processing ────────────────────────────────────────────────────────

interface VideoJob {
    id: string;
    input: {
        slug: string;
        title: string;
        image: string;
        category: string;
        excerpt: string;
        date: string;
    };
}

async function updateJob(jobId: string, patch: Record<string, unknown>) {
    await fetch(`${APP_URL}/api/video/status/${jobId}`, {
        method: "PATCH",
        headers: workerHeaders,
        body: JSON.stringify(patch),
    });
}

async function processJob(job: VideoJob) {
    const { id, input } = job;
    const { slug, title, image, category, excerpt, date } = input;

    console.log(`[worker] processing job ${id} — "${title.slice(0, 50)}"`);

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `so-video-${id}-`));
    const videoOut = path.join(tmpDir, "video.mp4");
    const thumbOut = path.join(tmpDir, "thumb.jpg");

    try {
        // ── 1. Bundle the Remotion composition ──
        console.log(`[worker] bundling...`);
        const bundled = await bundle({
            entryPoint: path.join(__dirname, "remotion", "index.ts"),
            // Webpack override — allow node_modules
            webpackOverride: (config) => config,
        });

        // ── 2. Select composition ──
        const composition = await selectComposition({
            serveUrl: bundled,
            id: "ArticleCard",
            inputProps: { title, image, category, excerpt, date },
        });

        // ── 3. Render video ──
        console.log(`[worker] rendering video...`);
        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: "h264",
            outputLocation: videoOut,
            inputProps: { title, image, category, excerpt, date },
            // Quality settings optimised for social media
            crf: 18,
            pixelFormat: "yuv420p",
            // Log progress every 10%
            onProgress: ({ progress }) => {
                if (Math.round(progress * 100) % 10 === 0) {
                    console.log(`[worker] render progress: ${Math.round(progress * 100)}%`);
                }
            },
        });

        // ── 4. Render thumbnail (frame 90 — image fully visible) ──
        console.log(`[worker] rendering thumbnail...`);
        await renderStill({
            composition,
            serveUrl: bundled,
            output: thumbOut,
            inputProps: { title, image, category, excerpt, date },
            frame: 90,
            imageFormat: "jpeg",
            jpegQuality: 90,
        });

        // ── 5. Upload to R2 ──
        console.log(`[worker] uploading to R2...`);
        const { videoKey, thumbnailKey } = buildKeys(slug);
        const [videoUrl, thumbnailUrl] = await Promise.all([
            uploadFile(videoKey, videoOut, "video/mp4"),
            uploadFile(thumbnailKey, thumbOut, "image/jpeg"),
        ]);

        // ── 6. Report success ──
        await updateJob(id, {
            status: "done",
            videoUrl,
            thumbnailUrl,
            completedAt: new Date().toISOString(),
        });

        console.log(`[worker] ✓ job ${id} done — ${videoUrl}`);

    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[worker] ✗ job ${id} failed:`, message);

        await updateJob(id, {
            status: "failed",
            error: message,
            completedAt: new Date().toISOString(),
        });
    } finally {
        // Clean up temp files
        await fs.rm(tmpDir, { recursive: true, force: true });
    }
}

// ── Poll loop ─────────────────────────────────────────────────────────────

async function poll() {
    try {
        const res = await fetch(`${APP_URL}/api/video/next`, {
            headers: workerHeaders,
        });

        if (res.status === 204) {
            // Queue empty — wait longer before next poll
            setTimeout(poll, POLL_INTERVAL);
            return;
        }

        if (!res.ok) {
            console.error(`[worker] /api/video/next returned ${res.status}`);
            setTimeout(poll, POLL_INTERVAL);
            return;
        }

        const job: VideoJob = await res.json();
        await processJob(job);

        // Immediately poll again — more jobs may be waiting
        setTimeout(poll, RETRY_INTERVAL);

    } catch (err) {
        console.error("[worker] poll error:", err);
        setTimeout(poll, POLL_INTERVAL);
    }
}

// ── Start ─────────────────────────────────────────────────────────────────

console.log(`[worker] starting — polling ${APP_URL}/api/video/next`);
poll();
