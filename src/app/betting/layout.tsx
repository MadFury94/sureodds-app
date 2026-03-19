import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

export const metadata: Metadata = {
    title: "Football Betting Tips & Predictions | Sureodds",
    description: "Community football betting tips, match predictions, odds and analysis. EPL, La Liga, Champions League, AFCON and more. Drop your tip today.",
    keywords: [
        "football betting tips", "soccer predictions", "match predictions",
        "betting odds", "EPL tips", "Champions League predictions", "AFCON tips",
        "football tips Nigeria", "sureodds betting",
    ],
    alternates: { canonical: `${SITE_URL}/betting` },
    openGraph: {
        type: "website",
        title: "Football Betting Tips & Predictions | Sureodds",
        description: "Community football betting tips, match predictions and odds analysis.",
        images: [{ url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80", width: 1200, height: 630, alt: "Betting Tips" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Football Betting Tips | Sureodds",
        description: "Community predictions, odds and match analysis.",
    },
};

export default function BettingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
