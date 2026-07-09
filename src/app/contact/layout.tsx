import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

export const metadata: Metadata = {
    title: "Contact Us | Sureodds",
    description:
        "Get in touch with the Sureodds team for advertising, press inquiries, partnerships, corrections or general questions.",
    alternates: { canonical: `${SITE_URL}/contact` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/contact`,
        title: "Contact Us | Sureodds",
        description: "Reach the Sureodds team for advertising, press, partnerships and support.",
        images: [{ url: `${SITE_URL}/logo.png`, width: 800, height: 800, alt: "Sureodds" }],
    },
    twitter: {
        card: "summary",
        title: "Contact Us | Sureodds",
        description: "Reach the Sureodds team for advertising, press, partnerships and support.",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
