# Football-Data.org API - Available Features

## Currently Using ✅
- **Competitions** - League information
- **Standings** - League tables (total, home, away)
- **Matches** - Fixtures and results (filtered by status: FINISHED, SCHEDULED, TIMED)

## Additional Features Available 🚀

### 1. Match Details (Individual Match)
Get detailed information about a specific match:
- **Head-to-Head stats** between the two teams
- **Lineups** - Starting XI and bench for both teams
- **Goals** - Minute, scorer, assist for each goal
- **Bookings** - Yellow/red cards with player and minute
- **Substitutions** - Player in/out with minute
- **Referees** - Match officials
- **Venue** - Stadium name
- **Attendance** - Number of spectators
- **Score breakdown** - Full time, half time, extra time, penalties

**Use case:** Create detailed match pages with lineups, goal scorers, and match events

### 2. Top Scorers
Get the top goal scorers for a competition:
- Player name and team
- Number of goals scored
- Number of assists (if available)
- Number of penalties scored

**Use case:** Add a "Top Scorers" section to league pages

### 3. Team Details
Get comprehensive team information:
- **Squad** - All players with:
  - Position
  - Date of birth
  - Nationality
  - Country of birth
- **Staff** - Coaches and technical staff
- **Club info** - Founded year, colors, venue, contact details
- **Team crest** - Logo URL

**Use case:** Create team profile pages with squad lists

### 4. Player Details
Get individual player information:
- Name, position, nationality
- Date of birth, country of birth
- **Player matches** - All matches the player has played in

**Use case:** Player profile pages

### 5. Competition Teams
Get all teams in a competition for a specific season:
- Team names, crests, IDs
- Can filter by season (current or historical)

**Use case:** Show all teams in a league

### 6. Match Filtering
Advanced filtering options:
- **By date range** - `dateFrom` and `dateTo` parameters
- **By status** - SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, SUSPENDED, POSTPONED, CANCELLED
- **By stage** - GROUP_STAGE, ROUND_OF_16, QUARTER_FINALS, SEMI_FINALS, FINAL
- **By group** - For group stage competitions

**Use case:** Create custom match calendars, show matches by date

### 7. Home/Away Standings
Get separate standings for:
- **Total** (overall)
- **Home** (home games only)
- **Away** (away games only)

**Use case:** Show form at home vs away

### 8. Historical Data
Access previous seasons:
- Use `?season=YYYY` parameter
- Get standings, matches, teams from past seasons

**Use case:** Historical comparisons, season archives

## API Endpoints Summary

```
GET /competitions                          # List all competitions
GET /competitions/{id}                     # Competition details
GET /competitions/{id}/matches             # All matches (filter by status, dates)
GET /competitions/{id}/standings           # League tables
GET /competitions/{id}/scorers             # Top scorers
GET /competitions/{id}/teams               # All teams in competition

GET /matches                               # Today's matches across all competitions
GET /matches/{id}                          # Detailed match info with lineups, goals, etc.

GET /teams/{id}                            # Team details with squad
GET /teams/{id}/matches                    # All team matches

GET /players/{id}                          # Player details
GET /players/{id}/matches                  # All player matches
```

## Free Tier Limits
- **10 requests per minute**
- **Access to major competitions**: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, World Cup, European Championship
- **No historical data** (only current season on free tier)

## Recommended Additions for Your App

### High Priority
1. **Top Scorers Section** - Easy to implement, adds value
2. **Match Detail Pages** - Show lineups, goals, cards for finished matches
3. **Team Pages** - Squad lists with player info

### Medium Priority
4. **Match Calendar** - Filter matches by date range
5. **Live Match Updates** - Show IN_PLAY matches with live scores
6. **Home/Away Form** - Separate standings tables

### Low Priority
7. **Player Pages** - Individual player stats
8. **Historical Comparisons** - Past season data (requires paid tier)

## Implementation Examples

### Top Scorers
```typescript
export async function getTopScorers(code: string, limit = 10) {
    const data = await fdFetch<{ scorers: Array<{
        player: { name: string; id: number };
        team: { name: string; crest: string };
        goals: number;
        assists: number | null;
        penalties: number | null;
    }> }>(`/competitions/${code}/scorers`, 600);
    
    return data?.scorers.slice(0, limit) ?? [];
}
```

### Match Details with Lineups
```typescript
export async function getMatchDetails(matchId: number) {
    const data = await fdFetch<{
        match: FDMatch;
        head2head: {
            numberOfMatches: number;
            homeTeam: { wins: number; draws: number; losses: number };
            awayTeam: { wins: number; draws: number; losses: number };
        };
    }>(`/matches/${matchId}`, 300);
    
    return data;
}
```

### Team Squad
```typescript
export async function getTeamSquad(teamId: number) {
    const data = await fdFetch<{
        squad: Array<{
            name: string;
            position: string;
            dateOfBirth: string;
            nationality: string;
        }>;
    }>(`/teams/${teamId}`, 86400);
    
    return data?.squad ?? [];
}
```
