import type { Metadata } from "next";
import { getTeamDetails } from "@/lib/footballdata";
import { SITE_URL, fonts } from "@/lib/config";
import { notFound } from "next/navigation";

const f = fonts.body;
const fd = fonts.display;

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const team = await getTeamDetails(parseInt(id));

    if (!team) {
        return {
            title: "Team Not Found | Sureodds",
        };
    }

    return {
        title: `${team.name} - Squad & Team Info | Sureodds`,
        description: `${team.name} squad list, player roster, team information, and statistics. Founded ${team.founded}.`,
        alternates: { canonical: `${SITE_URL}/team/${id}` },
        openGraph: {
            type: "website",
            url: `${SITE_URL}/team/${id}`,
            title: `${team.name} Squad`,
            description: `Complete squad list and team information for ${team.name}`,
            images: [{ url: team.crest, width: 400, height: 400, alt: team.name }],
        },
    };
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const team = await getTeamDetails(parseInt(id));

    if (!team) {
        notFound();
    }

    // Group players by position
    const goalkeepers = team.squad.filter(p => p.position === "Goalkeeper");
    const defenders = team.squad.filter(p => p.position === "Defender" || p.position === "Defence");
    const midfielders = team.squad.filter(p => p.position === "Midfielder" || p.position === "Midfield");
    const forwards = team.squad.filter(p => p.position === "Attacker" || p.position === "Offence" || p.position === "Forward");

    return (
        <div style={{ backgroundColor: "#f2f5f6", minHeight: "100vh" }}>
            {/* Team Header */}
            <div style={{ backgroundColor: "#1a1a1a", color: "#fff", padding: "4rem 0" }}>
                <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "0 1.2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
                        <img
                            src={team.crest}
                            alt={team.name}
                            width={120}
                            height={120}
                            style={{ width: "12rem", height: "12rem", objectFit: "contain", backgroundColor: "#fff", borderRadius: "1.2rem", padding: "1.6rem" }}
                        />
                        <div>
                            <h1 style={{ fontFamily: fd, fontSize: "4rem", fontWeight: 700, marginBottom: "1rem" }}>
                                {team.name}
                            </h1>
                            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                                <div>
                                    <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Founded: </span>
                                    <span style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 600 }}>{team.founded}</span>
                                </div>
                                <div>
                                    <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Venue: </span>
                                    <span style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 600 }}>{team.venue || "N/A"}</span>
                                </div>
                                <div>
                                    <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Colors: </span>
                                    <span style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 600 }}>{team.clubColors}</span>
                                </div>
                            </div>
                            {team.coach && (
                                <div style={{ marginTop: "1.6rem", padding: "1.2rem", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "0.8rem", display: "inline-block" }}>
                                    <span style={{ fontFamily: f, fontSize: "1.2rem", color: "#99989f" }}>Manager: </span>
                                    <span style={{ fontFamily: f, fontSize: "1.6rem", fontWeight: 700 }}>{team.coach.name}</span>
                                    {team.coach.nationality && (
                                        <span style={{ fontFamily: f, fontSize: "1.3rem", color: "#99989f", marginLeft: "0.8rem" }}>
                                            ({team.coach.nationality})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Squad */}
            <div style={{ maxWidth: "132.48rem", margin: "0 auto", padding: "4rem 1.2rem" }}>
                <h2 style={{ fontFamily: fd, fontSize: "2.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "3rem", textTransform: "uppercase" }}>
                    Squad
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(30rem, 1fr))", gap: "2rem" }}>
                    {/* Goalkeepers */}
                    {goalkeepers.length > 0 && (
                        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", border: "1px solid #e8ebed" }}>
                            <h3 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase", borderBottom: "3px solid #ff6b00", paddingBottom: "0.8rem" }}>
                                Goalkeepers
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {goalkeepers.map((player) => (
                                    <div key={player.id} style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                        <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                            {player.name}
                                        </div>
                                        <div style={{ display: "flex", gap: "1.6rem", fontSize: "1.2rem", color: "#99989f" }}>
                                            <span>{player.nationality}</span>
                                            <span>Born: {new Date(player.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Defenders */}
                    {defenders.length > 0 && (
                        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", border: "1px solid #e8ebed" }}>
                            <h3 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase", borderBottom: "3px solid #ff6b00", paddingBottom: "0.8rem" }}>
                                Defenders
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {defenders.map((player) => (
                                    <div key={player.id} style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                        <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                            {player.name}
                                        </div>
                                        <div style={{ display: "flex", gap: "1.6rem", fontSize: "1.2rem", color: "#99989f" }}>
                                            <span>{player.nationality}</span>
                                            <span>Born: {new Date(player.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Midfielders */}
                    {midfielders.length > 0 && (
                        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", border: "1px solid #e8ebed" }}>
                            <h3 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase", borderBottom: "3px solid #ff6b00", paddingBottom: "0.8rem" }}>
                                Midfielders
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {midfielders.map((player) => (
                                    <div key={player.id} style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                        <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                            {player.name}
                                        </div>
                                        <div style={{ display: "flex", gap: "1.6rem", fontSize: "1.2rem", color: "#99989f" }}>
                                            <span>{player.nationality}</span>
                                            <span>Born: {new Date(player.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Forwards */}
                    {forwards.length > 0 && (
                        <div style={{ backgroundColor: "#fff", borderRadius: "1.2rem", padding: "2rem", border: "1px solid #e8ebed" }}>
                            <h3 style={{ fontFamily: fd, fontSize: "1.8rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.6rem", textTransform: "uppercase", borderBottom: "3px solid #ff6b00", paddingBottom: "0.8rem" }}>
                                Forwards
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {forwards.map((player) => (
                                    <div key={player.id} style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.8rem" }}>
                                        <div style={{ fontFamily: f, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>
                                            {player.name}
                                        </div>
                                        <div style={{ display: "flex", gap: "1.6rem", fontSize: "1.2rem", color: "#99989f" }}>
                                            <span>{player.nationality}</span>
                                            <span>Born: {new Date(player.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Team Info */}
                {team.website && (
                    <div style={{ marginTop: "4rem", textAlign: "center" }}>
                        <a
                            href={team.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontFamily: f,
                                fontSize: "1.4rem",
                                fontWeight: 600,
                                color: "#ff6b00",
                                textDecoration: "none",
                                padding: "1.2rem 2.4rem",
                                backgroundColor: "#fff",
                                borderRadius: "0.8rem",
                                border: "2px solid #ff6b00",
                                display: "inline-block",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#ff6b00";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#fff";
                                e.currentTarget.style.color = "#ff6b00";
                            }}
                        >
                            Visit Official Website →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
