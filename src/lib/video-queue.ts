/**
 * Video render queue abstraction.
 *
 * The interface is stable — callers never import a concrete implementation.
 * Swap the backing store by changing getQueue() only.
 *
 * Current implementation: in-process Map (single instance, lost on restart).
 * Future: replace with BullMQ + Redis by implementing VideoQueue with Bull.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export type JobStatus = "queued" | "rendering" | "done" | "failed";

export interface VideoJobInput {
    slug: string;
    title: string;
    image: string;       // absolute URL
    category: string;
    excerpt: string;
    date: string;        // ISO string
}

export interface VideoJob {
    id: string;
    input: VideoJobInput;
    status: JobStatus;
    createdAt: string;   // ISO
    startedAt?: string;
    completedAt?: string;
    videoUrl?: string;   // R2 public URL
    thumbnailUrl?: string;
    error?: string;
    attempts: number;
}

// ── Interface ─────────────────────────────────────────────────────────────

export interface VideoQueue {
    enqueue(input: VideoJobInput): Promise<VideoJob>;
    getJob(id: string): Promise<VideoJob | null>;
    updateJob(id: string, patch: Partial<VideoJob>): Promise<VideoJob | null>;
    listJobs(limit?: number): Promise<VideoJob[]>;
    nextQueued(): Promise<VideoJob | null>;
}

// ── In-memory implementation ───────────────────────────────────────────────
// Works on Vercel (stateless) for job creation and status reads.
// The Railway worker maintains its OWN in-memory store and polls /api/video/next.
// Both sides share the same types — the transport layer is HTTP.

class InMemoryQueue implements VideoQueue {
    private store = new Map<string, VideoJob>();

    async enqueue(input: VideoJobInput): Promise<VideoJob> {
        const id = `vj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const job: VideoJob = {
            id,
            input,
            status: "queued",
            createdAt: new Date().toISOString(),
            attempts: 0,
        };
        this.store.set(id, job);
        return job;
    }

    async getJob(id: string): Promise<VideoJob | null> {
        return this.store.get(id) ?? null;
    }

    async updateJob(id: string, patch: Partial<VideoJob>): Promise<VideoJob | null> {
        const existing = this.store.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...patch };
        this.store.set(id, updated);
        return updated;
    }

    async listJobs(limit = 50): Promise<VideoJob[]> {
        return [...this.store.values()]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit);
    }

    async nextQueued(): Promise<VideoJob | null> {
        for (const job of this.store.values()) {
            if (job.status === "queued") return job;
        }
        return null;
    }
}

// ── Singleton ─────────────────────────────────────────────────────────────
// Next.js hot-reload creates a new module instance in dev — persist across
// reloads using the global object.

declare global {
    // eslint-disable-next-line no-var
    var __videoQueue: VideoQueue | undefined;
}

export function getQueue(): VideoQueue {
    if (!global.__videoQueue) {
        global.__videoQueue = new InMemoryQueue();
    }
    return global.__videoQueue;
}
