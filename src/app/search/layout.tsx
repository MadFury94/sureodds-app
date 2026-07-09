import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

export const metadata: Metadata = {
    title: "Search | Sureodds",
    description: "Search for football news, transfer updates, match reports and betting tips on Sureodds.",
    alternates: { canonical: `${SITE_URL}/search` },
    // Search results pages should not be indexed — they are thin/dynamic pages
    robots: {
        index: false,
        follow: true,
    },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
