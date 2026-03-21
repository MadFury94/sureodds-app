import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TrendingBar from "@/components/TrendingBar";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import { headers } from "next/headers";

const DEFAULT_DESCRIPTION =
  "Sureodds — expert football analysis, transfer news, match previews, betting tips, La Liga, EPL, UCL and AFCON coverage. Stay ahead of the game.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sureodds | Football News, Betting Tips & Match Analysis",
    template: "%s | Sureodds",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "football news", "soccer news", "betting tips", "match predictions",
    "EPL news", "La Liga news", "Champions League", "AFCON", "transfer news",
    "football analysis", "sureodds", "sports betting Nigeria",
  ],
  authors: [{ name: "Sureodds Editorial Team", url: SITE_URL }],
  creator: "Sureodds",
  publisher: "Sureodds",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Sureodds | Football News, Betting Tips & Match Analysis",
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Sureodds" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sureodds",
    creator: "@sureodds",
    title: "Sureodds | Football News, Betting Tips & Match Analysis",
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  },
  category: "sports",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? "";
  const isAdmin = pathname.startsWith("/admin-dashboard") || pathname.startsWith("/admin-login");

  return (
    <html lang="en">
      <head>
        {/* AdSense auto-ads — replace ca-pub-XXXXXXXXXXXXXXXX with your publisher ID */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');` }} />
          </>
        )}
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              sameAs: [
                "https://twitter.com/sureodds",
                "https://facebook.com/sureodds",
                "https://instagram.com/sureodds",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "info@sureodds.com",
                contactType: "customer support",
              },
            }),
          }}
        />
        {/* JSON-LD: WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body style={{ minHeight: "100vh", backgroundColor: "#f2f5f6" }}>
        {!isAdmin && <Navbar />}
        {!isAdmin && <TrendingBar />}
        {children}
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
