'use client';

import { useState } from 'react';

export default function TestAPIPage() {
    const [h2hData, setH2hData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [eventId, setEventId] = useState('xdbsZdb');

    const fetchH2HEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/sports/h2h?eventId=${eventId}`);
            const data = await response.json();
            if (response.ok) {
                setH2hData(data);
            } else {
                setError(data.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError('Failed to fetch H2H events');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">SportAPI Test Page</h1>

            <div className="mb-8">
                <label className="block mb-2 text-sm font-medium">
                    Event ID (customId):
                </label>
                <input
                    type="text"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="px-4 py-2 border rounded w-64 mr-4"
                    placeholder="Enter event ID"
                />
                <button
                    onClick={fetchH2HEvents}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Fetch Head-to-Head Events'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {h2hData && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        Head-to-Head Events ({h2hData.events?.length || 0} matches)
                    </h2>

                    {h2hData.events && h2hData.events.length > 0 ? (
                        <div className="space-y-4">
                            {h2hData.events.map((event: any, index: number) => (
                                <div key={index} className="p-4 border rounded bg-white shadow">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold">
                                            {event.homeTeam?.name} vs {event.awayTeam?.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {event.tournament?.name}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">
                                            {event.homeScore?.display} - {event.awayScore?.display}
                                        </div>
                                        <div className="text-sm">
                                            {event.status?.description} | {event.season?.name}
                                        </div>
                                    </div>
                                    {event.roundInfo && (
                                        <div className="text-sm text-gray-500 mt-2">
                                            {event.roundInfo.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600">No events found</p>
                    )}

                    <details className="mt-8">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View Raw JSON
                        </summary>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 mt-2">
                            {JSON.stringify(h2hData, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
}
