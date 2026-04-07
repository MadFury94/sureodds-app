import { NextResponse } from 'next/server';
import { sportAPI } from '@/lib/sportapi';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json(
                { error: 'Date parameter is required (format: YYYY-MM-DD)' },
                { status: 400 }
            );
        }

        const events = await sportAPI.getScheduledEvents(date);
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching scheduled events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scheduled events' },
            { status: 500 }
        );
    }
}
