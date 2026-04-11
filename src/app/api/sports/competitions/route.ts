import { NextResponse } from "next/server";

const BASE = "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY ?? "";

interface Competition {
    id: number;
    name: string;
    code: string;
    emblem: string;
    area: {
        name: string;
        flag: string;
    };
}

export async function GET() {
    if (!KEY) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    try {
        const res = await fetch(`${BASE}/competitions`, {
            headers: { "X-Auth-Token": KEY },
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch competitions" }, { status: res.status });
        }

        const data = await res.json();

        // Return ALL competitions - let the UI handle filtering
        const competitions = (data.competitions || [])
            .map((c: Competition) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                emblem: c.emblem,
                flag: c.area.flag,
                area: c.area.name,
            }))
            .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)); // Sort alphabetically

        return NextResponse.json({ competitions });
    } catch (error) {
        console.error("Error fetching competitions:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
