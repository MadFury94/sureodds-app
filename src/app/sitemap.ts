import type { MetadataRoute } from "next";
import { getAllPosts, getCategories } from "@/lib/wordpress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

const CATEGORY_SLUGS = [
    "news", "transfer", "breaking-news", "football-stories",
    "la-liga", "epl", "ucl", "afcon", "serie-a", "international-football",
    "blog",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // Static pages — ordered by importance
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
        { url: `${SITE_URL}/betting`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_URL}/bet-codes`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
        { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/advertise`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/creators`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
        { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: `${SITE_URL}/terms-of-use`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: `${SITE_URL}/community-guidelines`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        // /search and /h2h are noindex tool pages — intentionally excluded
    ];

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
        url: `${SITE_URL}/category/${slug}`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 0.9,
    }));

    // Article pages — fetch ALL posts (not just 100)
    let articlePages: MetadataRoute.Sitemap = [];
    try {
        const posts = await getAllPosts();
        articlePages = posts.map(post => ({
            url: `${SITE_URL}/article/${post.slug}`,
            lastModified: new Date(post.modified || post.date),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch { /* skip if WP is down */ }

    return [...staticPages, ...categoryPages, ...articlePages];
}
