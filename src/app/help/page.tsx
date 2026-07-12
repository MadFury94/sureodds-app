import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

export const metadata: Metadata = {
    title: "Help & Support | Sureodds",
    description: "Get help with your Sureodds account, subscription, betting tips and more.",
    alternates: { canonical: `${SITE_URL}/help` },
};

const faqs = [
    {
        q: "How do I subscribe to Sureodds premium tips?",
        a: "Go to the Subscribe page and choose a plan. Once payment is confirmed you'll have instant access to all premium betting tips, bet codes and the members dashboard.",
    },
    {
        q: "How do I access my betting tips?",
        a: "Log in to your account and visit the Betting Tips page. Premium subscribers will see all tips unlocked. Free users can view a limited preview.",
    },
    {
        q: "How do I cancel my subscription?",
        a: "Email support@sureodds.ng with your account email and we will cancel your subscription within 24 hours. You will retain access until the end of your current billing period.",
    },
    {
        q: "I forgot my password. How do I reset it?",
        a: "On the login page, click 'Forgot password' and enter your email address. We'll send you a magic link to sign in and reset your password.",
    },
    {
        q: "Why are my tips not loading?",
        a: "Make sure you are logged in and your subscription is active. If you are logged in but still seeing the locked view, try clearing your browser cache or contact support.",
    },
    {
        q: "How do I report a factual error in an article?",
        a: "Email corrections@sureodds.ng with the article URL and a brief description of the error. We aim to review and correct within 24 hours.",
    },
    {
        q: "Can I share articles from Sureodds?",
        a: "Yes — you can share links to any article freely. Reproducing full article text or images on another site without permission is not permitted.",
    },
    {
        q: "How do I advertise on Sureodds?",
        a: "Visit our Advertise page or email advertise@sureodds.ng with details about your campaign and budget.",
    },
];

export default function HelpPage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <style>{`
                .help-faq { border-top: 1px solid #e8ebed; }
                .help-item { padding: 2.4rem 0; border-bottom: 1px solid #e8ebed; }
            `}</style>

            <PageHeader
                title="Help & Support"
                subtitle="Find answers to common questions or get in touch with our team."
                image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80"
            />

            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "6rem 1.6rem 8rem" }}>

                {/* FAQ */}
                <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "clamp(2.4rem,4vw,3.2rem)", color: "#1a1a1a", textTransform: "uppercase", marginBottom: "3.2rem" }}>
                    Frequently Asked Questions
                </h2>

                <div className="help-faq">
                    {faqs.map(item => (
                        <div key={item.q} className="help-item">
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.7rem", color: "#1a1a1a", marginBottom: "0.8rem" }}>
                                {item.q}
                            </h3>
                            <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d", lineHeight: 1.75 }}>
                                {item.a}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Contact card */}
                <div style={{ marginTop: "6rem", backgroundColor: "#1a1a1a", borderRadius: "1.6rem", padding: "4rem 3.2rem", textAlign: "center" }}>
                    <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#fff", textTransform: "uppercase", marginBottom: "1.2rem" }}>
                        Still need help?
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#888", marginBottom: "2.4rem" }}>
                        Our support team usually responds within a few hours.
                    </p>
                    <a href="mailto:support@sureodds.ng" style={{ display: "inline-block", padding: "1.2rem 3.2rem", backgroundColor: "#ff6b00", borderRadius: "0.8rem", fontFamily: f, fontSize: "1.5rem", fontWeight: 700, color: "#fff", textDecoration: "none" }}>
                        support@sureodds.ng
                    </a>
                </div>

            </div>
        </div>
    );
}
