import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

export const metadata: Metadata = {
    title: "Terms of Use | Sureodds",
    description: "Sureodds Terms of Use — the rules and conditions that govern your use of our website and services.",
    alternates: { canonical: `${SITE_URL}/terms-of-use` },
};

const sections = [
    {
        title: "Acceptance of Terms",
        body: `By accessing or using sureodds.ng, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use our site. We reserve the right to update these terms at any time. Continued use of the site after changes constitutes acceptance.`,
    },
    {
        title: "Use of the Site",
        body: `You may use this site for lawful, personal, non-commercial purposes only. You agree not to reproduce, redistribute, sell, or exploit any content from this site without our prior written consent. You must not use the site in any way that could damage, disable, or impair it, or interfere with other users' enjoyment of it.`,
    },
    {
        title: "Intellectual Property",
        body: `All content on sureodds.ng — including articles, images, graphics, logos, video and data — is the property of Sureodds or its content suppliers and is protected by copyright law. You may share links to our content, but reproducing full articles or images without permission is prohibited.`,
    },
    {
        title: "Betting Tips Disclaimer",
        body: `Betting tips and predictions published on Sureodds are for informational and entertainment purposes only. They do not constitute financial or professional betting advice. Gambling involves risk and you may lose money. Please gamble responsibly. If gambling is causing you harm, visit www.gamblersanonymous.org or contact a local support service. Sureodds accepts no liability for any losses incurred as a result of acting on information published on this site.`,
    },
    {
        title: "User Accounts",
        body: `If you create an account on Sureodds, you are responsible for maintaining the security of your login credentials and for all activity under your account. Notify us immediately at support@sureodds.ng if you suspect unauthorised access. We reserve the right to terminate accounts that violate these terms.`,
    },
    {
        title: "Third-Party Links",
        body: `Our site may contain links to third-party websites. These links are provided for your convenience only. We have no control over those sites and accept no responsibility for their content, privacy practices, or availability.`,
    },
    {
        title: "Advertising",
        body: `Sureodds displays advertisements through Google AdSense and other ad networks. Advertisements are clearly distinguished from editorial content. We are not responsible for the content of advertisements or for the products or services they promote.`,
    },
    {
        title: "Limitation of Liability",
        body: `To the fullest extent permitted by law, Sureodds shall not be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of, or inability to use, this site or its content. Our total liability to you for any claim shall not exceed the amount paid by you, if any, to access our services.`,
    },
    {
        title: "Governing Law",
        body: `These Terms of Use are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.`,
    },
    {
        title: "Contact",
        body: `For questions about these Terms of Use, contact us at legal@sureodds.ng.`,
    },
];

export default function TermsOfUsePage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <PageHeader
                title="Terms of Use"
                subtitle={`Effective date: 1 January 2025 — Last updated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
                image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80"
            />
            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "6rem 1.6rem 8rem" }}>
                <p style={{ fontFamily: f, fontSize: "1.7rem", color: "#3d3c41", lineHeight: 1.75, marginBottom: "4rem", padding: "2.4rem", backgroundColor: "#f2f5f6", borderRadius: "0.8rem" }}>
                    Please read these Terms of Use carefully before using sureodds.ng. These terms govern your access to and use of our website and services.
                </p>
                {sections.map(s => (
                    <div key={s.title} style={{ marginBottom: "4rem" }}>
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
