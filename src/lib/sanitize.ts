// HTML sanitizer — strips XSS vectors from WordPress/user content
// Uses isomorphic-dompurify so it works on both SSR and client

import DOMPurify from "isomorphic-dompurify";

// Allowed HTML tags for article content
const ALLOWED_TAGS = [
    "p", "br", "b", "i", "strong", "em", "u", "s", "del",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote", "pre", "code",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span", "section", "article", "aside",
    "hr", "sup", "sub",
];

// Allowed attributes
const ALLOWED_ATTR = [
    "href", "src", "alt", "title", "class", "id",
    "width", "height", "loading", "decoding",
    "target", "rel",
    // Table attributes
    "colspan", "rowspan",
];

export function sanitizeHtml(html: string): string {
    if (!html) return "";
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        // Force rel="noopener noreferrer" on all links
        FORCE_BODY: false,
        // Prevent DOM clobbering
        SANITIZE_DOM: true,
        // Block all data: URIs except images
        ALLOW_DATA_ATTR: false,
    });
}

// Lighter sanitizer for excerpts/descriptions — strips all HTML
export function stripHtmlTags(html: string): string {
    if (!html) return "";
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// Sanitize a plain text string — removes all HTML
export function sanitizeText(text: string): string {
    if (!text) return "";
    return stripHtmlTags(text).trim();
}
