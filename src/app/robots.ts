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
                    // Old/dead URL patterns — stop crawlers wasting crawl budget
                    "/home",
                    "/article$",
                    "/predictions-betting-tips",
                    "/tag/",
                    "/page/",
                    "/live-scores",
                    "/daily-tips",
                    "/feed.xml",
                    "/editorial-guidelines",
                    "/terms-conditions",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
