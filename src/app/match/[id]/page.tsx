import type { Metadata } from "next";
import { getMatchDetails } from "@/lib/footballdata";
import { SITE_URL } from "@/lib/config";
import MatchDetail from "@/components/MatchDetail";
import { notFound } from "next/navigation";

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const details = await getMatchDetails(parseInt(id));

    if (!details) {
        return {
            title: "Match Not Found | Sureodds",
        };
    }

    // Handle both response formats: { match: {...} } or direct match object
    const match = details.match || details;
    const title = `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.competition.name}`;
    const description = match.status === "FINISHED"
        ? `${match.homeTeam.name} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${match.awayTeam.name}. Full match details, lineups, goals, and statistics.`
        : `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.competition.name} match preview and details.`;

    return {
        title: `${title} | Sureodds`,
        description,
        alternates: { canonical: `${SITE_URL}/match/${id}` },
        openGraph: {
            type: "article",
            url: `${SITE_URL}/match/${id}`,
            title,
            description,
        },
    };
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const details = await getMatchDetails(parseInt(id));

    if (!details) {
        notFound();
    }

    return (
        <div style={{ backgroundColor: "#f2f5f6", minHeight: "100vh", paddingTop: "2rem", paddingBottom: "4rem" }}>
            <MatchDetail details={details} />
        </div>
    );
}
