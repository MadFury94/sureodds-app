import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
