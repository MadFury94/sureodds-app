import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";

export const metadata: Metadata = {
    title: "About Sureodds | Football News & Analysis",
    description: "Sureodds is a football media brand built by fans, for fans. Sharp takes, real analysis, and zero fluff on EPL, La Liga, UCL, AFCON and more.",
    alternates: { canonical: `${SITE_URL}/about` },
    openGraph: {
        type: "website",
        title: "About Sureodds",
        description: "Built by fans, for fans. Expert football coverage with zero fluff.",
        url: `${SITE_URL}/about`,
        images: [{ url: `${SITE_URL}/logo.png`, width: 800, height: 800, alt: "Sureodds" }],
    },
    twitter: {
        card: "summary",
        title: "About Sureodds",
        description: "Built by fans, for fans. Expert football coverage with zero fluff.",
        images: [`${SITE_URL}/logo.png`],
    },
};

const team = [
    { name: "JFakayejo Paul Adeluyi", role: "Editor in Chief", initials: "JE", bio: "15 years covering football. Former beat writer for three clubs." },

];

export default function AboutPage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <style>{`
                .about-wrap { max-width: 132.48rem; margin: 0 auto; padding: 5rem 1.6rem 7rem; }

                /* Mission */
                .about-mission {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5rem;
                    align-items: center;
                    margin-bottom: 6rem;
                }
                .about-mission-img {
                    aspect-ratio: 4/3;
                    overflow: hidden;
                    border-radius: 0.8rem;
                }
                .about-mission-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

                /* Stats */
                .about-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                    margin-bottom: 6rem;
                    padding: 3.2rem 2rem;
                    background: #f2f5f6;
                    border-radius: 1.2rem;
                    text-align: center;
                }

                /* Team */
                .about-team {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 2.4rem;
                }
                .about-member { display: flex; flex-direction: column; gap: 1.2rem; }
                .about-avatar {
                    width: 6.4rem; height: 6.4rem; border-radius: 50%;
                    background: #1a1a1a; display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                /* Tablet */
                @media (max-width: 900px) {
                    .about-mission { grid-template-columns: 1fr; gap: 3rem; margin-bottom: 4rem; }
                    .about-mission-img { max-height: 28rem; }
                    .about-team { grid-template-columns: repeat(2, 1fr); gap: 2.4rem; }
                }

                /* Mobile */
                @media (max-width: 600px) {
                    .about-wrap { padding: 3.2rem 1.6rem 5rem; }
                    .about-stats { padding: 2rem 1.4rem; gap: 0; }
                    .about-stats > div { padding: 0 0.4rem; }
                    .about-team { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
                    .about-member { gap: 0.8rem; }
                }
            `}</style>

            <PageHeader
                title="About Sureodds"
                subtitle="A football media brand built for fans who want sharp takes, real analysis, and zero fluff."
                image="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80"
            />

            <div className="about-wrap">

                {/* Mission */}
                <div className="about-mission">
                    <div>
                        <p style={{ fontFamily: '"Druk Text Wide","Arial Black",sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#ff6b00", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem" }}>
                            Our Mission
                        </p>
                        <h2 style={{ fontFamily: '"Druk Text Wide","Arial Black",sans-serif', fontWeight: 700, fontSize: "clamp(2.4rem, 4vw, 3.6rem)", color: "#1a1a1a", lineHeight: 1.1, marginBottom: "2rem" }}>
                            Built by fans, for fans
                        </h2>
                        <p style={{ fontFamily: '"Proxima Nova",Arial,sans-serif', fontSize: "1.7rem", color: "#3d3c41", lineHeight: 1.75, marginBottom: "1.6rem" }}>
                            We started Sureodds because we were tired of sports coverage that talked down to its audience. Every article we publish assumes you know the game — because you do.
                        </p>
                        <p style={{ fontFamily: '"Proxima Nova",Arial,sans-serif', fontSize: "1.7rem", color: "#3d3c41", lineHeight: 1.75 }}>
                            Our writers are fans first. They argue about the same things you argue about. They lose sleep over the same games. That energy is what you get in every piece we publish.
                        </p>
                    </div>
                    <div className="about-mission-img">
                        <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80" alt="Football coverage" />
                    </div>
                </div>

                {/* Stats */}
                <div className="about-stats">
                    {[
                        { num: "100K+", label: "Monthly Readers" },
                        { num: "10+", label: "Articles Per Week" },
                        { num: "8", label: "Leagues Covered" },
                    ].map(s => (
                        <div key={s.label}>
                            <p style={{ fontFamily: '"Druk Text Wide","Arial Black",sans-serif', fontWeight: 700, fontSize: "clamp(2.8rem, 5vw, 5rem)", color: "#1a1a1a", lineHeight: 1 }}>{s.num}</p>
                            <p style={{ fontFamily: '"Proxima Nova",Arial,sans-serif', fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)", color: "#68676d", marginTop: "0.6rem" }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Team */}
                <h2 style={{ fontFamily: '"Druk Text Wide","Arial Black",sans-serif', fontWeight: 700, fontSize: "clamp(2.4rem, 4vw, 3.2rem)", color: "#1a1a1a", marginBottom: "3.2rem" }}>
                    The Team
                </h2>
                <div className="about-team">
                    {team.map(m => (
                        <div key={m.name} className="about-member">
                            <div className="about-avatar">
                                <span style={{ fontFamily: '"Druk Text Wide","Arial Black",sans-serif', fontWeight: 700, fontSize: "2rem", color: "#fff" }}>{m.initials}</span>
                            </div>
                            <div>
                                <p style={{ fontFamily: '"Proxima Nova",Arial,sans-serif', fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", marginBottom: "0.2rem" }}>{m.name}</p>
                                <p style={{ fontFamily: '"Proxima Nova",Arial,sans-serif', fontSize: "1.2rem", color: "#ff6b00", fontWeight: 600, marginBottom: "0.6rem" }}>{m.role}</p>
                                <p style={{ fontFamily: '"Proxima Nova",Arial,sans-serif', fontSize: "1.3rem", color: "#68676d", lineHeight: 1.5 }}>{m.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
