import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/Icon";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sureodds.ng";
const f = '"Proxima Nova", Arial, sans-serif';
const fd = '"Druk Text Wide", "Arial Black", sans-serif';

export const metadata: Metadata = {
    title: "Community Guidelines | Sureodds",
    description: "Sureodds Community Guidelines — how we expect our readers and community members to behave on our platform.",
    alternates: { canonical: `${SITE_URL}/community-guidelines` },
};

const rules = [
    { icon: "football" as const, title: "Keep it football", body: "Stay on topic. This is a football community. Debates, opinions and passionate takes are welcome — but keep them relevant to the game." },
    { icon: "respect" as const, title: "Respect everyone", body: "Disagree with the analysis, not the person. Abuse, harassment, threats or personal attacks of any kind will result in immediate removal." },
    { icon: "ban" as const, title: "No hate speech", body: "Content that attacks people based on race, ethnicity, nationality, religion, gender, sexual orientation or disability is strictly prohibited." },
    { icon: "megaphone" as const, title: "No spam", body: "Do not post unsolicited promotional content, referral links, betting affiliate codes, or repeated identical messages." },
    { icon: "check" as const, title: "Be accurate", body: "If you're sharing news or stats, make sure they're correct. Spreading misinformation undermines the community. If you're unsure, say so." },
    { icon: "shield" as const, title: "Age-appropriate", body: "No explicit, graphic or sexually suggestive content. This platform is accessible to readers of all ages." },
    { icon: "scale" as const, title: "Gamble responsibly", body: "Do not pressure others to gamble. Do not promote gambling to minors. Include responsible gambling reminders where appropriate." },
    { icon: "lock" as const, title: "Privacy", body: "Do not share private information about other people — addresses, phone numbers, workplaces or any details they have not made public." },
];

export default function CommunityGuidelinesPage() {
    return (
        <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            <style>{`
                .cg-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 2.4rem; margin-bottom: 6rem; }
                .cg-card { padding: 2.8rem; border: 1.5px solid #e8ebed; border-radius: 1.2rem; display: flex; gap: 2rem; align-items: flex-start; }
                .cg-icon { width: 4.4rem; height: 4.4rem; border-radius: 0.8rem; background: #f2f5f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                @media(max-width:600px){ .cg-grid { grid-template-columns: 1fr; } .cg-card { flex-direction: column; gap: 1.2rem; } }
            `}</style>

            <PageHeader
                title="Community Guidelines"
                subtitle="How we expect everyone on Sureodds to treat each other and the platform."
                image="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1600&q=80"
                badge="The Rules"
                badgeColor="#1a1a1a"
            />

            <div style={{ maxWidth: "96rem", margin: "0 auto", padding: "6rem 1.6rem 8rem" }}>
                <p style={{ fontFamily: f, fontSize: "1.7rem", color: "#3d3c41", lineHeight: 1.75, marginBottom: "5rem", maxWidth: "72rem" }}>
                    Sureodds is a place for football fans to read, debate and share in the game they love. These guidelines keep that space respectful, accurate and enjoyable for everyone. Violations may result in content removal or account suspension.
                </p>

                <div className="cg-grid">
                    {rules.map(r => (
                        <div key={r.title} className="cg-card">
                            <div className="cg-icon">
                                <Icon name={r.icon} size={22} color="#1a1a1a" />
                            </div>
                            <div>
                                <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "1.6rem", color: "#1a1a1a", textTransform: "uppercase", marginBottom: "0.8rem" }}>{r.title}</h3>
                                <p style={{ fontFamily: f, fontSize: "1.5rem", color: "#68676d", lineHeight: 1.65 }}>{r.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ backgroundColor: "#f2f5f6", borderRadius: "1.2rem", padding: "3.2rem", textAlign: "center" }}>
                    <h3 style={{ fontFamily: fd, fontWeight: 700, fontSize: "2rem", color: "#1a1a1a", textTransform: "uppercase", marginBottom: "1.2rem" }}>
                        Report a violation
                    </h3>
                    <p style={{ fontFamily: f, fontSize: "1.6rem", color: "#68676d", marginBottom: "2rem" }}>
                        If you see content that violates these guidelines, let us know.
                    </p>
                    <a href="mailto:corrections@sureodds.ng" style={{ display: "inline-block", padding: "1.2rem 3.2rem", backgroundColor: "#1a1a1a", borderRadius: "0.8rem", fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#fff", textDecoration: "none" }}>
                        corrections@sureodds.ng
                    </a>
                </div>
            </div>
        </div>
    );
}
