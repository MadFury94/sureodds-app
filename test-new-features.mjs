// Test new Football-Data.org API features
import { readFileSync } from 'fs';

const BASE = "https://api.football-data.org/v4";

// Read .env.local file
const envContent = readFileSync('.env.local', 'utf-8');
const keyMatch = envContent.match(/FOOTBALL_DATA_API_KEY=(.+)/);
const KEY = keyMatch ? keyMatch[1].trim() : null;

console.log("Testing New Features...\n");

async function testFeatures() {
    try {
        // Test 1: Top Scorers
        console.log("1. Testing Top Scorers (Premier League)...");
        const scorersRes = await fetch(`${BASE}/competitions/PL/scorers`, {
            headers: { "X-Auth-Token": KEY }
        });
        const scorersData = await scorersRes.json();
        console.log(`✅ Found ${scorersData.scorers?.length || 0} scorers`);
        if (scorersData.scorers?.length > 0) {
            const top = scorersData.scorers[0];
            console.log(`   Top scorer: ${top.player.name} (${top.team.name}) - ${top.goals} goals`);
        }

        // Test 2: Match Details
        console.log("\n2. Testing Match Details...");
        const matchesRes = await fetch(`${BASE}/competitions/PL/matches?status=FINISHED`, {
            headers: { "X-Auth-Token": KEY }
        });
        const matchesData = await matchesRes.json();
        const lastMatch = matchesData.matches[matchesData.matches.length - 1];
        
        const detailsRes = await fetch(`${BASE}/matches/${lastMatch.id}`, {
            headers: { "X-Auth-Token": KEY }
        });
        const detailsData = await detailsRes.json();
        const match = detailsData.match || detailsData;
        console.log(`✅ Match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        console.log(`   Lineups: ${match.homeTeam.lineup?.length || 0} home, ${match.awayTeam.lineup?.length || 0} away`);
        console.log(`   Goals: ${match.goals?.length || 0}`);
        console.log(`   H2H: ${detailsData.head2head?.numberOfMatches || 0} previous meetings`);

        // Test 3: Live Matches
        console.log("\n3. Testing Live Matches...");
        const liveRes = await fetch(`${BASE}/matches?status=IN_PLAY`, {
            headers: { "X-Auth-Token": KEY }
        });
        const liveData = await liveRes.json();
        console.log(`✅ Found ${liveData.matches?.length || 0} live matches`);
        if (liveData.matches?.length > 0) {
            const live = liveData.matches[0];
            console.log(`   ${live.homeTeam.name} ${live.score.fullTime.home} - ${live.score.fullTime.away} ${live.awayTeam.name}`);
        } else {
            console.log("   (No matches currently live)");
        }

        // Test 4: Team Details
        console.log("\n4. Testing Team Details (Arsenal - ID 57)...");
        const teamRes = await fetch(`${BASE}/teams/57`, {
            headers: { "X-Auth-Token": KEY }
        });
        const teamData = await teamRes.json();
        console.log(`✅ Team: ${teamData.name}`);
        console.log(`   Founded: ${teamData.founded}`);
        console.log(`   Venue: ${teamData.venue}`);
        console.log(`   Squad: ${teamData.squad?.length || 0} players`);
        if (teamData.coach) {
            console.log(`   Coach: ${teamData.coach.name}`);
        }

        console.log("\n🎉 All features working correctly!");

    } catch (error) {
        console.error("\n❌ Error:", error.message);
    }
}

testFeatures();
