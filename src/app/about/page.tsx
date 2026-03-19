import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
    title: "About Sureodds | Football News & Analysis",
    description: "Sureodds is a football media brand built by fans, for fans. Sharp takes, real analysis, and zero fluff on EPL, La Liga, UCL, AFCON and more.",
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng"}/about` },
    openGraph: {
        type: "website",
        title: "About Sureodds",
        description: "Built by fans, for fans. Expert football coverage with zero fluff.",
    },
};

const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

const team = [
    { name: "Jordan Ellis", role: "Editor in Chief", initials: "JE", bio: "15 years covering the NFL and NBA. Former beat writer for three franchises." },
    { name: "Marcus Webb", role: "Senior NFL Writer", initials: "MW", bio: "Draft analyst and salary cap nerd. Knows every contract clause in the league." },
    { name: "Sofia Reyes", role: "Soccer Correspondent", initials: "SR", bio: "Champions League obsessive. Covers European football from Madrid." },
    { name: "Darius King", role: "NBA Editor", initials: "DK", bio: "Advanced stats advocate. Believes in the process, always." },
];

export default function AboutPage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

            <PageHeader
                title="About Sureodds"
                subtitle="A sports blog built for fans who want sharp takes, real analysis, and zero fluff."
                image="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80"
            />

            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "6rem 1.2rem" }}>

                {/* Mission */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center", marginBottom: "8rem" }}>
                    <div>
                        <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.2rem", color: "#e9173d", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem" }}>
                            Our Mission
                        </p>
                        <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "3.6rem", color: "#1a1a1a", lineHeight: 1.1, marginBottom: "2rem" }}>
                            Built by fans, for fans
                        </h2>
                        <p style={{ fontFamily: f, fontSize: "1.7rem", color: "#3d3c41", lineHeight: 1.75, marginBottom: "1.6rem" }}>
                            We started Sureodds because we were tired of sports coverage that talked down to its audience. Every article we publish assumes you know the game — because you do.
                        </p>
                        <p style={{ fontFamily: f, fontSize: "1.7rem", color: "#3d3c41", lineHeight: 1.75 }}>
                            Our writers are fans first. They argue about the same things you argue about. They lose sleep over the same games. That energy is what you get in every piece we publish.
                        </p>
                    </div>
                    <div style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: "0.8rem" }}>
                        <img
                            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"
                            alt="Sports coverage"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.84rem", marginBottom: "8rem", padding: "4rem", backgroundColor: "#f2f5f6", borderRadius: "1.2rem" }}>
                    {[
                        { num: "2M+", label: "Monthly Readers" },
                        { num: "50+", label: "Articles Per Week" },
                        { num: "8", label: "Sports Covered" },
                    ].map(stat => (
                        <div key={stat.label} style={{ textAlign: "center" }}>
                            <p style={{ fontFamily: fd, fontWeight: 700, fontSize: "5rem", color: "#1a1a1a", lineHeight: 1 }}>{stat.num}</p>
                            <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d", marginTop: "0.8rem" }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Team */}
                <h2 style={{ fontFamily: fd, fontWeight: 700, fontSize: "3.2rem", color: "#1a1a1a", marginBottom: "3.2rem" }}>
                    The Team
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2.84rem" }}>
                    {team.map(member => (
                        <div key={member.name} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                            <div style={{
                                width: "7.2rem", height: "7.2rem", borderRadius: "50%",
                                backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <span style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#fff" }}>{member.initials}</span>
                            </div>
                            <div>
                                <p style={{ fontFamily: f, fontWeight: 700, fontSize: "1.7rem", color: "#1a1a1a" }}>{member.name}</p>
                                <p style={{ fontFamily: f, fontSize: "1.3rem", color: "#e9173d", fontWeight: 600, marginBottom: "0.6rem" }}>{member.role}</p>
                                <p style={{ fontFamily: f, fontSize: "1.4rem", color: "#68676d", lineHeight: 1.5 }}>{member.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
