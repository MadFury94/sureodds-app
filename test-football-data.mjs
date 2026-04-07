// Test Football-Data.org API
import { readFileSync } from 'fs';

const BASE = "https://api.football-data.org/v4";

// Read .env.local file
const envContent = readFileSync('.env.local', 'utf-8');
const keyMatch = envContent.match(/FOOTBALL_DATA_API_KEY=(.+)/);
const KEY = keyMatch ? keyMatch[1].trim() : null;

console.log("Testing Football-Data.org API...");
console.log("API Key:", KEY ? `${KEY.substring(0, 8)}...` : "MISSING");

async function testAPI() {
    try {
        // Test 1: Get Premier League recent matches
        console.log("\n1. Testing Premier League recent matches...");
        const plResponse = await fetch(`${BASE}/competitions/PL/matches?status=FINISHED`, {
            headers: { "X-Auth-Token": KEY }
        });
        
        console.log("Status:", plResponse.status, plResponse.statusText);
        
        if (!plResponse.ok) {
            const error = await plResponse.text();
            console.log("Error:", error);
            return;
        }
        
        const plData = await plResponse.json();
        console.log("Recent matches found:", plData.matches?.length || 0);
        if (plData.matches?.length > 0) {
            const match = plData.matches[plData.matches.length - 1];
            console.log("Latest match:", match.homeTeam.name, "vs", match.awayTeam.name, "-", match.score.fullTime.home, "-", match.score.fullTime.away);
        }
        
        // Test 2: Get upcoming matches
        console.log("\n2. Testing Premier League upcoming matches...");
        const upcomingResponse = await fetch(`${BASE}/competitions/PL/matches?status=SCHEDULED,TIMED`, {
            headers: { "X-Auth-Token": KEY }
        });
        
        const upcomingData = await upcomingResponse.json();
        console.log("Upcoming matches found:", upcomingData.matches?.length || 0);
        if (upcomingData.matches?.length > 0) {
            const match = upcomingData.matches[0];
            console.log("Next match:", match.homeTeam.name, "vs", match.awayTeam.name, "on", new Date(match.utcDate).toLocaleDateString());
        }
        
        // Test 3: Get standings
        console.log("\n3. Testing Premier League standings...");
        const standingsResponse = await fetch(`${BASE}/competitions/PL/standings`, {
            headers: { "X-Auth-Token": KEY }
        });
        
        const standingsData = await standingsResponse.json();
        const table = standingsData.standings?.find(s => s.type === "TOTAL")?.table;
        console.log("Standings found:", table?.length || 0, "teams");
        if (table?.length > 0) {
            console.log("Top 3:");
            table.slice(0, 3).forEach(row => {
                console.log(`  ${row.position}. ${row.team.name} - ${row.points} pts`);
            });
        }
        
        console.log("\n✅ API is working correctly!");
        
    } catch (error) {
        console.error("\n❌ Error:", error.message);
    }
}

testAPI();
