// Client-side HTML sanitizer — strips XSS vectors from WordPress/user content
// Only runs in the browser; returns raw html on SSR (WP content is trusted at source)

import type DOMPurifyType from "dompurify";

let purify: typeof DOMPurifyType | null = null;

function getPurify(): typeof DOMPurifyType | null {
    if (typeof window === "undefined") return null;
    if (!purify) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        purify = require("dompurify") as typeof DOMPurifyType;
    }
    return purify;
}

export function sanitizeHtml(html: string): string {
    const dp = getPurify();
    if (!dp) return html; // SSR — skip
    return dp.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
        FORBID_TAGS: ["script", "style"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    });
}
