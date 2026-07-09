import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const OG_IMAGE = `${SITE_URL}/logo.png`;

export const metadata: Metadata = {
    title: "Free Bet Codes & Booking Codes | Sureodds",
    description:
        "Daily free and premium bet codes from expert punters. Copy booking codes directly to Betway, Sportybet, 1xBet and more. Updated daily.",
    keywords: [
        "bet codes", "booking codes", "free bet codes", "sure banker", "betway codes",
        "sportybet codes", "football bet codes Nigeria",
    ],
    alternates: { canonical: `${SITE_URL}/bet-codes` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/bet-codes`,
        title: "Free Bet Codes & Booking Codes | Sureodds",
        description: "Daily free and premium bet codes with booking references. Copy and paste directly.",
        images: [{ url: OG_IMAGE, width: 800, height: 800, alt: "Sureodds bet codes" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Bet Codes | Sureodds",
        description: "Daily free and premium football bet codes. Copy directly to your bookmaker.",
        images: [OG_IMAGE],
    },
};

export default function BetCodesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
