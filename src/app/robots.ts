import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin-dashboard/",
                    "/admin-login",
                    "/api/",
                    "/dashboard/",
                    "/register",
                    "/login",
                    "/subscribe",
                    // Old/dead URL patterns that return 404 — stop crawlers wasting crawl budget
                    "/home",
                    "/article$",          // bare /article with no slug
                    "/predictions-betting-tips",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
