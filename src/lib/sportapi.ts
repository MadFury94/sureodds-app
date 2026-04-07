// SportAPI Client for RapidAPI
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'sportapi7.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}/api/v1`;

interface SportAPIOptions {
    endpoint: string;
    params?: Record<string, string | number>;
}

export class SportAPIClient {
    private async request<T>(options: SportAPIOptions): Promise<T> {
        const { endpoint, params } = options;

        const url = new URL(`${BASE_URL}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }

        const headers = {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key': RAPIDAPI_KEY || '',
        };

        console.log('Making request to:', url.toString());
        console.log('Headers:', { ...headers, 'x-rapidapi-key': headers['x-rapidapi-key'] ? '***' + headers['x-rapidapi-key'].slice(-4) : 'missing' });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
            next: { revalidate: 60 }, // Cache for 60 seconds
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`SportAPI Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Get categories list
    async getCategories() {
        return this.request({ endpoint: '/sport/categories/list' });
    }

    // Get live categories
    async getLiveCategories() {
        return this.request({ endpoint: '/sport/live/categories' });
    }

    // Get current live events
    async getCurrentLiveEvents() {
        return this.request({ endpoint: '/sport/event/current' });
    }

    // Get scheduled events for a date
    async getScheduledEvents(date: string) {
        return this.request({
            endpoint: '/sport/event/scheduled/date',
            params: { date }
        });
    }

    // Get head to head events between two teams
    async getHead2HeadEvents(eventId: string) {
        return this.request({
            endpoint: `/event/${eventId}/h2h/events`
        });
    }

    // Get event details
    async getEventDetails(eventId: string) {
        return this.request({
            endpoint: '/sport/event/details',
            params: { id: eventId }
        });
    }

    // Get tournaments on date
    async getTournamentsOnDate(date: string) {
        return this.request({
            endpoint: '/sport/tournaments/date',
            params: { date }
        });
    }

    // Get odds for all events scheduled on date
    async getOddsForDate(date: string) {
        return this.request({
            endpoint: '/sport/odds/scheduled/date',
            params: { date }
        });
    }
}

export const sportAPI = new SportAPIClient();
