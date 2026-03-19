import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

export const metadata: Metadata = {
    title: "Contact Us | Sureodds",
    description: "Get in touch with the Sureodds team. Advertising, press, partnerships, corrections and general enquiries.",
    alternates: { canonical: `${SITE_URL}/contact` },
    openGraph: {
        type: "website",
        title: "Contact Sureodds",
        description: "Reach out for advertising, press, partnerships or general enquiries.",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
