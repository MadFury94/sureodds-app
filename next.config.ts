import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // ── www → non-www (canonical domain) ─────────────────────────────────
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sureodds.ng" }],
        destination: "https://sureodds.ng/:path*",
        permanent: true,
      },
      // ── Old/stale URLs crawled by Google ─────────────────────────────────
      // /home → /
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      // /article (no slug) → /
      {
        source: "/article",
        destination: "/",
        permanent: true,
      },
      // /predictions-betting-tips → /betting
      {
        source: "/predictions-betting-tips",
        destination: "/betting",
        permanent: true,
      },
      // /predictions-betting-tips/:slug → /article/:slug
      {
        source: "/predictions-betting-tips/:slug",
        destination: "/article/:slug",
        permanent: true,
      },
      // /category/:sport/page/:num — old WP pagination
      {
        source: "/category/:sport/page/:num",
        destination: "/category/:sport",
        permanent: true,
      },
      // /category/:sport/:sub — e.g. /category/epl/epl-top-headline
      {
        source: "/category/:sport/:sub",
        destination: "/category/:sport",
        permanent: true,
      },
      // /tag/:tag — WordPress tag pages don't exist
      {
        source: "/tag/:tag",
        destination: "/",
        permanent: true,
      },
      // /tag/:tag/page/:num
      {
        source: "/tag/:tag/page/:num",
        destination: "/",
        permanent: true,
      },
      // /tag/:tag/feed/ — WordPress RSS for tags
      {
        source: "/tag/:tag/feed",
        destination: "/",
        permanent: true,
      },
      // /:slug/feed/ — WordPress per-post RSS feeds
      {
        source: "/:slug/feed",
        destination: "/article/:slug",
        permanent: true,
      },
      // /page/:num — WordPress root pagination e.g. /page/2/, /page/122/
      {
        source: "/page/:num",
        destination: "/",
        permanent: true,
      },
      // /live-scores — old page that doesn't exist
      {
        source: "/live-scores",
        destination: "/",
        permanent: true,
      },
      // /daily-tips — old page
      {
        source: "/daily-tips",
        destination: "/betting",
        permanent: true,
      },
      // /editorial-guidelines — old WP page
      {
        source: "/editorial-guidelines",
        destination: "/about",
        permanent: true,
      },
      // /terms-conditions — old WP page
      {
        source: "/terms-conditions",
        destination: "/about",
        permanent: true,
      },
      // /feed.xml — redirect to home (RSS not implemented)
      {
        source: "/feed.xml",
        destination: "/",
        permanent: false,
      },
      // /$  and /& — garbage crawler URLs
      {
        source: "/$",
        destination: "/",
        permanent: true,
      },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.sureodds.ng" },
      { protocol: "https", hostname: "**.wordpress.com" },
      { protocol: "https", hostname: "**.wp.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "r2.thesportsdb.com" },
      { protocol: "https", hostname: "crests.football-data.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-inline required for Next.js inline scripts + AdSense/GA
              // unsafe-eval required for Next.js dev + some ad scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'" +
              " https://platform.twitter.com" +
              " https://syndication.twitter.com" +
              " https://pagead2.googlesyndication.com" +
              " https://partner.googleadservices.com" +
              " https://www.googletagmanager.com" +
              " https://www.google-analytics.com" +
              " https://adservice.google.com" +
              " https://googleads.g.doubleclick.net" +
              " https://tpc.googlesyndication.com",
              "frame-src 'self'" +
              " https://syndication.twitter.com" +
              " https://platform.twitter.com" +
              " https://twitter.com" +
              " https://googleads.g.doubleclick.net" +
              " https://tpc.googlesyndication.com" +
              " https://www.youtube.com",
              // Allow images from any HTTPS source (needed for WP media + CDNs)
              "img-src 'self' data: blob: https:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https:" +
              " https://www.google-analytics.com" +
              " https://analytics.google.com" +
              " https://stats.g.doubleclick.net",
              "media-src 'self' https:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only allow framing from same origin
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Strict referrer for privacy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for 1 year, include subdomains
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Disable browser features not needed
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Prevent XSS in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|webp|svg|woff|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Never cache API routes
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
