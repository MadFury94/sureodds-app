import type { MetadataRoute } from "next";
import { getPosts, getCategories } from "@/lib/wordpress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

const CATEGORY_SLUGS = [
    "news", "transfer", "breaking-news", "football-stories",
    "la-liga", "epl", "ucl", "afcon", "serie-a", "international-football",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
        { url: `${SITE_URL}/betting`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
        { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ];

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
        url: `${SITE_URL}/category/${slug}`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 0.9,
    }));

    // Article pages — fetch latest 100
    let articlePages: MetadataRoute.Sitemap = [];
    try {
        const posts = await getPosts({ perPage: 100 });
        articlePages = posts.map(post => ({
            url: `${SITE_URL}/article/${post.slug}`,
            lastModified: new Date(post.date),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch { /* skip if WP is down */ }

    return [...staticPages, ...categoryPages, ...articlePages];
}
