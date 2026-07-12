import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

export const metadata: Metadata = {
    title: "Privacy Policy | Sureodds",
    description: "Sureodds Privacy Policy — how we collect, use and protect your personal information.",
    alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

const sections = [
    {
        title: "Information We Collect",
        body: `We collect information you provide directly — such as your name and email address when you register, subscribe to our newsletter, or contact us. We also automatically collect certain technical data when you visit our site, including your IP address, browser type, device type, pages visited and referring URLs. This data is collected via cookies and similar tracking technologies.`,
    },
    {
        title: "How We Use Your Information",
        body: `We use your information to provide and improve our services, send you newsletters and updates you've subscribed to, respond to your enquiries, analyse site usage and performance, serve relevant advertising, and comply with legal obligations. We do not sell your personal information to third parties.`,
    },
    {
        title: "Cookies & Tracking",
        body: `We use first-party and third-party cookies for site functionality, analytics (Google Analytics), and advertising (Google AdSense). You can control cookie preferences through your browser settings. By continuing to use our site, you consent to our use of cookies as described in this policy. We participate in Google's personalised advertising programme — see the AdChoices section below for opt-out options.`,
    },
    {
        title: "Google AdSense & Advertising",
        id: "adchoices",
        body: `Sureodds uses Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to our site or other websites. You can opt out of personalised advertising by visiting Google's Ads Settings at https://adssettings.google.com. We also comply with the IAB Transparency and Consent Framework.`,
    },
    {
        title: "Do Not Sell or Share My Personal Information",
        id: "do-not-sell",
        body: `We do not sell your personal information. If you are a California resident under the CCPA or are subject to other applicable privacy laws, you have the right to request that we disclose what personal information we collect and to opt out of any sale or sharing of that information. To exercise this right, contact us at privacy@sureodds.ng. We will respond within 45 days.`,
    },
    {
        title: "Data Retention",
        body: `We retain personal data only as long as necessary to fulfil the purposes for which it was collected, or as required by law. Newsletter subscribers can unsubscribe at any time via the link in any email we send.`,
    },
    {
        title: "Third-Party Services",
        body: `Our site may contain links to third-party websites. This Privacy Policy applies only to sureodds.ng. We are not responsible for the privacy practices of external sites and encourage you to read their policies before providing personal information.`,
    },
    {
        title: "Your Rights",
        body: `You have the right to access, correct or delete the personal information we hold about you. To make a request, contact privacy@sureodds.ng. We may ask you to verify your identity before processing your request.`,
    },
    {
        title: "Changes to This Policy",
        body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated effective date. Continued use of our site after any changes constitutes acceptance of the updated policy.`,
    },
    {
        title: "Contact",
        body: `If you have questions about this Privacy Policy or how we handle your data, contact us at privacy@sureodds.ng.`,
    },
];

export default function PrivacyPolicyPage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <PageHeader
                title="Privacy Policy"
                subtitle={`Effective date: 1 January 2025 — Last updated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
                image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&q=80"
            />
            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "6rem 1.6rem 8rem" }}>
                <p style={{ fontFamily: f, fontSize: "1.7rem", color: "#3d3c41", lineHeight: 1.75, marginBottom: "4rem", padding: "2.4rem", backgroundColor: "#f2f5f6", borderRadius: "0.8rem" }}>
                    This Privacy Policy explains how Sureodds ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") collects, uses, and protects information about you when you use our website at sureodds.ng.
                </p>
                {sections.map(s => (
                    <div key={s.title} id={s.id} style={{ marginBottom: "4rem", scrollMarginTop: "10rem" }}>
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "1.2rem", paddingBottom: "1rem", borderBottom: "2px solid #f2f5f6" }}>
                            {s.title}
                        </h2>
                        <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#3d3c41", lineHeight: 1.8 }}>{s.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
