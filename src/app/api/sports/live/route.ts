import { NextResponse } from 'next/server';
import { sportAPI } from '@/lib/sportapi';

export async function GET() {
    try {
        const liveEvents = await sportAPI.getCurrentLiveEvents();
        return NextResponse.json(liveEvents);
    } catch (error) {
        console.error('Error fetching live events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch live events' },
            { status: 500 }
        );
    }
}
