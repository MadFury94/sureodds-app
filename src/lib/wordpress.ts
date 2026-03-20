import { WP_API_BASE, FALLBACK_IMAGE } from "@/lib/config";

const BASE = WP_API_BASE;

export interface WPPost {
    id: number;
    slug: string;
    date: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    featured_media: number;
    jetpack_featured_media_url?: string;
    categories: number[];
    _embedded?: {
        "wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>;
        "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
        author?: Array<{ name: string }>;
    };
}

export interface WPCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
}


async function wpFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        next: { revalidate: 60 },
        ...options,
    });
    if (!res.ok) throw new Error(`WP API error: ${res.status} ${path}`);
    return res.json();
}

export async function getPosts(opts: {
    perPage?: number;
    page?: number;
    categoryId?: number;
    search?: string;
    slug?: string;
} = {}): Promise<WPPost[]> {
    const params = new URLSearchParams();
    params.set("_embed", "1");
    params.set("per_page", String(opts.perPage ?? 10));
    if (opts.page) params.set("page", String(opts.page));
    if (opts.categoryId) params.set("categories", String(opts.categoryId));
    if (opts.search) params.set("search", opts.search);
    if (opts.slug) params.set("slug", opts.slug);

    // Slug lookups must never be cached — each slug is unique
    const fetchOpts = opts.slug ? { cache: "no-store" as const } : undefined;
    return wpFetch<WPPost[]>(`/posts?${params}`, fetchOpts);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
    const params = new URLSearchParams({ _embed: "1", per_page: "1", slug });
    const res = await fetch(`${BASE}/posts?${params}`, { cache: "no-store" });
    if (!res.ok) return null;
    const posts: WPPost[] = await res.json();
    return posts[0] ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
    return wpFetch<WPCategory[]>("/categories?per_page=100");
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
    const cats = await wpFetch<WPCategory[]>(`/categories?slug=${slug}`);
    return cats[0] ?? null;
}

/** Get featured image — prefers jetpack_featured_media_url, falls back to _embedded */
export function getFeaturedImage(post: WPPost): string {
    if (post.jetpack_featured_media_url) return post.jetpack_featured_media_url;
    return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? FALLBACK_IMAGE;
}

/** Get category name from embedded terms */
export function getPostCategory(post: WPPost): string {
    return post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Sports";
}

/** Get author name */
export function getPostAuthor(post: WPPost): string {
    return post._embedded?.author?.[0]?.name ?? "Sureodds Staff";
}

/** Decode common HTML entities from WP rendered titles */
export function decodeTitle(html: string): string {
    return html
        .replace(/&amp;/g, "&")
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8211;/g, "–")
        .replace(/&#8212;/g, "—")
        .replace(/&hellip;/g, "…")
        .replace(/&nbsp;/g, " ");
}

/** Strip HTML tags */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").trim();
}

/** Format WP date */
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });
}
