import { NextResponse } from 'next/server';
import { sportAPI } from '@/lib/sportapi';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId parameter is required' },
                { status: 400 }
            );
        }

        const h2hData = await sportAPI.getHead2HeadEvents(eventId);
        return NextResponse.json(h2hData);
    } catch (error) {
        console.error('Error fetching H2H events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch H2H events' },
            { status: 500 }
        );
    }
}
