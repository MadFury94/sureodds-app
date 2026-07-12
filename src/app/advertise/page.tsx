import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/Icon";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

export const metadata: Metadata = {
    title: "Advertise with Sureodds | Reach Football Fans in Nigeria & Africa",
    description: "Partner with Sureodds to reach millions of passionate football fans across Nigeria and Africa. Display ads, sponsored content, newsletter placements and more.",
    alternates: { canonical: `${SITE_URL}/advertise` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/advertise`,
        title: "Advertise with Sureodds",
        description: "Reach millions of passionate football fans. Display ads, sponsored content, newsletter placements.",
        images: [{ url: `${SITE_URL}/logo.png`, width: 800, height: 800, alt: "Sureodds" }],
    },
};

const adFormats = [
    { icon: "article" as const, title: "Sponsored Articles", desc: "Native content written by our editorial team or supplied by you. Published alongside organic editorial and clearly labelled as sponsored." },
    { icon: "display" as const, title: "Display Advertising", desc: "High-visibility banner placements across homepage, category pages and article sidebars. Desktop and mobile formats available." },
    { icon: "newsletter" as const, title: "Newsletter Sponsorship", desc: "Reach our engaged email subscribers directly. Logo placement, dedicated sections or full takeovers available." },
    { icon: "social" as const, title: "Social Amplification", desc: "Boost your campaign reach across our Twitter, Instagram, Facebook and TikTok channels with dedicated posts." },
    { icon: "target" as const, title: "Category Takeovers", desc: "Own an entire category — EPL, La Liga, UCL, AFCON — for a set period. Maximum brand visibility for sports-specific campaigns." },
    { icon: "handshake" as const, title: "Custom Partnerships", desc: "Have something else in mind? We're open to creative partnerships. Get in touch and let's build something together." },
];

const stats = [
    { num: "2M+", label: "Monthly Readers" },
    { num: "60%", label: "Mobile Audience" },
    { num: "18–34", label: "Core Age Group" },
    { num: "Nigeria", label: "Primary Market" },
];

export default function AdvertisePage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <style>{`
                .adv-wrap  { max-width: 132.48rem; margin: 0 auto; padding: 6rem 1.6rem 8rem; }
                .adv-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 2rem; margin-bottom: 7rem; }
                .adv-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 2.4rem; margin-bottom: 7rem; }
                .adv-card  { padding: 2.8rem; border: 1.5px solid #e8ebed; border-radius: 1.2rem; }
                .adv-icon  { width: 4.8rem; height: 4.8rem; border-radius: 1rem; background: #f2f5f6;
                             display: flex; align-items: center; justify-content: center; margin-bottom: 1.6rem; }
                @media(max-width:900px){
                    .adv-stats { grid-template-columns: repeat(2,1fr); }
                    .adv-grid  { grid-template-columns: repeat(2,1fr); }
                }
                @media(max-width:600px){
                    .adv-stats { grid-template-columns: repeat(2,1fr); gap:1.2rem; }
                    .adv-grid  { grid-template-columns: 1fr; }
                }
            `}</style>

            <PageHeader
                title="Advertise"
                subtitle="Put your brand in front of millions of passionate football fans across Nigeria and Africa."
                image="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80"
                badge="Partner with us"
                badgeColor="#ff6b00"
            />

            <div className="adv-wrap">

                {/* Stats */}
                <div className="adv-stats">
                    {stats.map(s => (
                        <div key={s.label} style={{ textAlign: "center", padding: "2.4rem 1.6rem", backgroundColor: "#f2f5f6", borderRadius: "1.2rem" }}>
                            <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "clamp(2.4rem,4vw,4rem)", color: "#1a1a1a", lineHeight: 1 }}>{s.num}</p>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", marginTop: "0.6rem" }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Ad formats */}
                <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "clamp(2.4rem,4vw,3.2rem)", color: "#1a1a1a", marginBottom: "3.2rem", textTransform: "uppercase" }}>
                    Advertising Options
                </h2>
                <div className="adv-grid">
                    {adFormats.map(fmt => (
                        <div key={fmt.title} className="adv-card">
                            <div className="adv-icon">
                                <Icon name={fmt.icon} size={24} color="#ff6b00" />
                            </div>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", marginBottom: "0.8rem", textTransform: "uppercase" }}>{fmt.title}</h3>
                            <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", lineHeight: 1.65 }}>{fmt.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ backgroundColor: "#1a1a1a", borderRadius: "1.6rem", padding: "5rem 3.2rem", textAlign: "center" }}>
                    <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "clamp(2.4rem,4vw,3.6rem)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "1.6rem" }}>
                        Ready to reach our audience?
                    </h2>
                    <p style={{ fontFamily: f, fontSize: "1.7rem", color: "#888", maxWidth: "56rem", margin: "0 auto 3.2rem", lineHeight: 1.65 }}>
                        Get in touch with our partnerships team and we'll put together a proposal tailored to your goals and budget.
                    </p>
                    <a href="mailto:advertise@sureodds.ng" style={{ display: "inline-block", padding: "1.4rem 3.6rem", backgroundColor: "#ff6b00", borderRadius: "0.8rem", fontFamily: fd, fontSize: "1.5rem", fontWeight: 700, color: "#fff", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        advertise@sureodds.ng
                    </a>
                </div>

            </div>
        </div>
    );
}
