/**
 * Cloudflare R2 upload utility.
 *
 * R2 exposes an S3-compatible API — we use @aws-sdk/client-s3 pointed at
 * the R2 endpoint. No separate R2 SDK needed.
 *
 * Required env vars:
 *   R2_ACCOUNT_ID       — Cloudflare account ID
 *   R2_ACCESS_KEY_ID    — R2 API token access key
 *   R2_SECRET_ACCESS_KEY — R2 API token secret
 *   R2_BUCKET_NAME      — bucket name (e.g. "sureodds-videos")
 *   R2_PUBLIC_URL       — public bucket URL (e.g. https://videos.sureodds.ng)
 */

import {
    S3Client,
    PutObjectCommand,
    type PutObjectCommandInput,
} from "@aws-sdk/client-s3";

function getR2Client(): S3Client {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId) throw new Error("R2_ACCOUNT_ID is not set");

    return new S3Client({
        region: "auto",
        // Use jurisdiction-specific endpoint for WNAM (Western North America)
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
        },
        // Required for R2 — disable checksum which R2 doesn't support
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
    });
}

export interface UploadResult {
    key: string;
    publicUrl: string;
}

/**
 * Upload a Buffer or Uint8Array to R2.
 *
 * @param key    Object key inside the bucket  e.g. "videos/my-article.mp4"
 * @param body   File contents as Buffer
 * @param contentType  MIME type e.g. "video/mp4" or "image/jpeg"
 */
export async function uploadToR2(
    key: string,
    body: Buffer,
    contentType: string
): Promise<UploadResult> {
    const bucket = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

    if (!bucket) throw new Error("R2_BUCKET_NAME is not set");
    if (!publicUrl) throw new Error("R2_PUBLIC_URL is not set");

    const client = getR2Client();

    const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        // Make the object publicly readable via the custom domain
        // (requires the bucket to have public access enabled in Cloudflare)
    };

    await client.send(new PutObjectCommand(params));

    return {
        key,
        publicUrl: `${publicUrl}/${key}`,
    };
}

/**
 * Generate consistent R2 keys for a video job.
 * e.g.  videos/2026/07/my-article-slug.mp4
 *       thumbnails/2026/07/my-article-slug.jpg
 */
export function buildR2Keys(slug: string): { videoKey: string; thumbnailKey: string } {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const safe = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();

    return {
        videoKey: `videos/${yyyy}/${mm}/${safe}.mp4`,
        thumbnailKey: `thumbnails/${yyyy}/${mm}/${safe}.jpg`,
    };
}
