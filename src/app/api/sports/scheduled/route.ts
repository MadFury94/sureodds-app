import { NextResponse } from 'next/server';

const BASE = "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY ?? "";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const competition = searchParams.get('competition'); // e.g., "PL", "PD", "CL"

    if (!competition) {
        return NextResponse.json(
            { error: 'Competition parameter is required (e.g., PL, PD, CL)' },
            { status: 400 }
        );
    }

    if (!KEY) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    try {
        // Fetch scheduled/timed matches for the competition
        const res = await fetch(
            `${BASE}/competitions/${competition}/matches?status=SCHEDULED,TIMED`,
            {
                headers: { "X-Auth-Token": KEY },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!res.ok) {
            console.error(`Football-Data API error: ${res.status} ${res.statusText}`);
            return NextResponse.json(
                { error: 'Failed to fetch matches' },
                { status: res.status }
            );
        }

        const data = await res.json();

        // Return matches with all the data needed for the UI
        return NextResponse.json({
            matches: data.matches || [],
            competition: data.competition || null,
        });
    } catch (error) {
        console.error('Error fetching scheduled matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scheduled matches' },
            { status: 500 }
        );
    }
}
