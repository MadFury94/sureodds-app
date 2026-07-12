import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

export const metadata: Metadata = {
    title: "Careers | Sureodds",
    description: "Join the Sureodds team. We're building the leading football media brand in Nigeria and Africa — come build it with us.",
    alternates: { canonical: `${SITE_URL}/careers` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/careers`,
        title: "Careers at Sureodds",
        description: "Join the team building the leading football media brand in Nigeria and Africa.",
        images: [{ url: `${SITE_URL}/logo.png`, width: 800, height: 800, alt: "Sureodds" }],
    },
};

const values = [
    { icon: "⚽", title: "Fans first", body: "We write for people who watch every match, not just the highlights. Our best work comes from genuine passion for the game." },
    { icon: "📊", title: "Data-driven", body: "We back our takes with numbers. Good football writing isn't just opinion — it's opinion supported by evidence." },
    { icon: "🚀", title: "Move fast", body: "Football news doesn't wait. We ship quickly, iterate constantly, and fix things on the go." },
    { icon: "🌍", title: "Africa-focused", body: "We cover the world game through an African lens. Nigerian and African football is not an afterthought here — it's the point." },
];

const openRoles = [
    { title: "Football Writer (Freelance)", type: "Freelance · Remote", desc: "Cover match reports, transfer news, and analysis. Experience in sports journalism preferred. Strong knowledge of African and European football required." },
    { title: "Social Media Manager", type: "Full-time · Lagos", desc: "Grow and manage our presence across Twitter/X, Instagram, TikTok and Facebook. Football obsessive, strong copywriting skills, and platform-native thinking essential." },
    { title: "Frontend Developer", type: "Contract · Remote", desc: "Next.js, TypeScript and React. Help us build fast, beautiful, content-rich football experiences. Experience with headless CMS setups a plus." },
    { title: "Video Editor", type: "Freelance · Remote", desc: "Short-form football content for social and the site. Fast turnaround, strong eye for storytelling, comfortable with match footage." },
];

export default function CareersPage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <style>{`
                .careers-values { display: grid; grid-template-columns: repeat(4,1fr); gap: 2rem; margin-bottom: 7rem; }
                .careers-roles  { display: flex; flex-direction: column; gap: 1.6rem; margin-bottom: 7rem; }
                .careers-role   { padding: 2.8rem; border: 1.5px solid #e8ebed; border-radius: 1.2rem; }
                @media(max-width:900px){ .careers-values { grid-template-columns: repeat(2,1fr); } }
                @media(max-width:600px){ .careers-values { grid-template-columns: 1fr 1fr; gap:1.6rem; } }
            `}</style>

            <PageHeader
                title="Careers"
                subtitle="Help us build the leading football media brand in Nigeria and Africa."
                image="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80"
                badge="We're hiring"
                badgeColor="#ff6b00"
            />

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "6rem 1.6rem 8rem" }}>

                {/* Values */}
                <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "clamp(2.4rem,4vw,3.2rem)", color: "#1a1a1a", textTransform: "uppercase", marginBottom: "3.2rem" }}>
                    How we work
                </h2>
                <div className="careers-values">
                    {values.map(v => (
                        <div key={v.title} style={{ padding: "2.4rem", backgroundColor: "#f2f5f6", borderRadius: "1.2rem" }}>
                            <p style={{ fontSize: "2.8rem", marginBottom: "1.2rem" }}>{v.icon}</p>
                            <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.5rem", color: "#1a1a1a", textTransform: "uppercase", marginBottom: "0.8rem" }}>{v.title}</h3>
                            <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", lineHeight: 1.6 }}>{v.body}</p>
                        </div>
                    ))}
                </div>

                {/* Open roles */}
                <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "clamp(2.4rem,4vw,3.2rem)", color: "#1a1a1a", textTransform: "uppercase", marginBottom: "3.2rem" }}>
                    Open Roles
                </h2>
                <div className="careers-roles">
                    {openRoles.map(role => (
                        <div key={role.title} className="careers-role">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.2rem", marginBottom: "1.2rem" }}>
                                <div>
                                    <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.8rem", color: "#1a1a1a", marginBottom: "0.4rem" }}>{role.title}</h3>
                                    <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#ff6b00", fontWeight: 600 }}>{role.type}</span>
                                </div>
                                <a href={`mailto:careers@sureodds.ng?subject=Application: ${encodeURIComponent(role.title)}`}
                                    style={{ padding: "1rem 2.4rem", backgroundColor: "#1a1a1a", borderRadius: "0.6rem", fontFamily: f, fontSize: "1.3rem", fontWeight: 700, color: "#fff", textDecoration: "none", whiteSpace: "nowrap" }}>
                                    Apply →
                                </a>
                            </div>
                            <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", lineHeight: 1.65 }}>{role.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Speculative */}
                <div style={{ backgroundColor: "#1a1a1a", borderRadius: "1.6rem", padding: "4rem 3.2rem", textAlign: "center" }}>
                    <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2.4rem", color: "#fff", textTransform: "uppercase", marginBottom: "1.2rem" }}>
                        Don't see your role?
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#888", marginBottom: "2.4rem", maxWidth: "52rem", margin: "0 auto 2.4rem" }}>
                        We're always interested in hearing from talented people who love football. Send us your CV and a note about what you'd bring.
                    </p>
                    <a href="mailto:careers@sureodds.ng" style={{ display: "inline-block", padding: "1.2rem 3.2rem", backgroundColor: "#ff6b00", borderRadius: "0.8rem", fontFamily: f, fontSize: "1.5rem", fontWeight: 700, color: "#fff", textDecoration: "none" }}>
                        careers@sureodds.ng
                    </a>
                </div>

            </div>
        </div>
    );
}
