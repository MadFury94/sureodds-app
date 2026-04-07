import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/footballdata";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
    try {
        const matches = await getLiveMatches();
        return NextResponse.json({ matches }, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Error fetching live matches:", error);
        return NextResponse.json({ matches: [] }, { status: 500 });
    }
}
