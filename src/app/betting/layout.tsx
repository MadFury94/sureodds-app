import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const OG_IMAGE = `${SITE_URL}/logo.png`;

export const metadata: Metadata = {
    title: "Expert Betting Tips & Daily Predictions | Sureodds",
    description:
        "Get expert football betting tips, accumulators and daily predictions from Sureodds analysts. EPL, La Liga, UCL, AFCON and more. Updated daily.",
    keywords: [
        "betting tips", "football predictions", "sure odds", "accumulator tips",
        "EPL betting tips", "football betting Nigeria", "today's predictions",
    ],
    alternates: { canonical: `${SITE_URL}/betting` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/betting`,
        title: "Expert Betting Tips & Daily Predictions | Sureodds",
        description: "Daily expert football betting tips from specialist analysts. Accumulators, singles, high-confidence picks and win/loss tracking.",
        images: [{ url: OG_IMAGE, width: 800, height: 800, alt: "Sureodds betting tips" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Expert Betting Tips | Sureodds",
        description: "Daily football predictions and accumulators from Sureodds analysts.",
        images: [OG_IMAGE],
    },
};

export default function BettingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
