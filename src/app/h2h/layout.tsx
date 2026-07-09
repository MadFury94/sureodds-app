import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

export const metadata: Metadata = {
    title: "Head-to-Head Stats | Sureodds",
    description:
        "Compare historical head-to-head records between football teams. Analyse past meetings, goals, wins and draws to inform your betting decisions.",
    alternates: { canonical: `${SITE_URL}/h2h` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/h2h`,
        title: "Head-to-Head Football Stats | Sureodds",
        description: "Historical H2H records between any two football teams — matches, goals, wins.",
        images: [{ url: `${SITE_URL}/logo.png`, width: 800, height: 800, alt: "Sureodds H2H" }],
    },
    // Tool/interactive page — good content but we don't want duplicate/thin versions indexed
    robots: {
        index: true,
        follow: true,
    },
};

export default function H2HLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
