// ── Site ──────────────────────────────────────────────────────────────────
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
export const SITE_NAME = "Sureodds";
export const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API ?? "https://sureodds.ng/wp-json/wp/v2";

// ── Design tokens ─────────────────────────────────────────────────────────
export const colors = {
    // Primary
    primary: "#e9173d",   // red — CTAs, badges, accents
    primaryDark: "#b60122",   // red hover / dark variant

    // Neutrals
    white: "#ffffff",
    gray50: "#f2f5f6",
    gray100: "#e8ebed",
    gray200: "#ddd",
    gray300: "#c9c9c9",
    gray400: "#99989f",
    gray500: "#68676d",
    gray600: "#3d3c41",
    gray700: "#27262a",
    gray800: "#1a1a1a",
    black: "#000000",

    // Category / league accent colours
    epl: "#38003c",
    laLiga: "#ff4b00",
    ucl: "#1a1f71",
    afcon: "#009a44",
} as const;

// ── Typography ────────────────────────────────────────────────────────────
export const fonts = {
    body: '"Proxima Nova", Arial, sans-serif',
    display: '"Druk Text Wide", "Arial Black", sans-serif',
} as const;

// ── Layout ────────────────────────────────────────────────────────────────
export const MAX_WIDTH = "132.48rem";

// ── League logos (hotlink-safe CDN sources) ───────────────────────────────
export const LEAGUE_LOGOS: Record<string, string> = {
    epl: "https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png",
    "english-premier-league": "https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png",
    "la-liga": "https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png",
    ucl: "https://crests.football-data.org/CL.png",
    "uefa-champions-league": "https://crests.football-data.org/CL.png",
    afcon: "/afconlogo.svg",
    "africa-cup-of-nations": "/afconlogo.svg",
};

// ── Category page header background images ────────────────────────────────
export const CATEGORY_IMAGES: Record<string, string> = {
    epl: "https://r2.thesportsdb.com/images/media/league/fanart/odberp1725731801.jpg",
    "la-liga": "https://r2.thesportsdb.com/images/media/league/fanart/6am8r81707716890.jpg",
    ucl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1800&q=85",
    afcon: "/afconbg.webp",
    news: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=85",
    transfer: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1800&q=85",
    "breaking-news": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1800&q=85",
    "football-stories": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1800&q=85",
    "international-football": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1800&q=85",
    blog: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1800&q=85",
};

// ── Category metadata ─────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
    news: "Football News",
    transfer: "Transfer News",
    "breaking-news": "Breaking News",
    "football-stories": "Football Stories",
    "la-liga": "La Liga",
    epl: "English Premier League",
    ucl: "UEFA Champions League",
    afcon: "Africa Cup of Nations",
    "international-football": "International Football",
    blog: "Blog",
};

export const CATEGORY_COLORS: Record<string, string> = {
    news: colors.gray500,
    transfer: colors.primary,
    "breaking-news": colors.primary,
    "football-stories": colors.gray800,
    "la-liga": colors.laLiga,
    epl: colors.epl,
    ucl: colors.ucl,
    afcon: colors.afcon,
    "international-football": colors.gray500,
    blog: colors.gray500,
};

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=900&q=80";

// ── Twitter / X feed URLs ─────────────────────────────────────────────────
// Replace with your real profile URL and list URLs once set up on Twitter.
// Leave as undefined to show the dummy tweet cards placeholder.
export const TWITTER_FEEDS: Record<string, string | undefined> = {
    default: undefined, // e.g. "https://twitter.com/sureoddsng"
    epl: undefined, // e.g. "https://twitter.com/i/lists/YOUR_EPL_LIST_ID"
    "la-liga": undefined,
    ucl: undefined,
    afcon: undefined,
    transfer: undefined,
    "breaking-news": undefined,
    news: undefined,
};
