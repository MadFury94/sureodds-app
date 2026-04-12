# Live Odds Integration Guide

## Overview
The site now fetches live betting odds from The-Odds-API and displays them on betting buttons. If the API is not configured, it falls back to estimated odds.

## Setup Instructions

### 1. Get Your Free API Key

1. Visit [The-Odds-API](https://the-odds-api.com/)
2. Click "Get API Key" or "Sign Up"
3. Create a free account
4. Copy your API key from the dashboard

**Free Tier Limits:**
- 500 requests per month
- Real-time odds from 80+ bookmakers
- Covers major football leagues

### 2. Configure Environment Variable

Add your API key to `.env.local`:

```env
ODDS_API_KEY=your_actual_api_key_here
```

Replace `your_odds_api_key_here` with your actual key.

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### Automatic Odds Fetching
- When a punter selects a league and views matches, odds are automatically fetched for the first 5 matches
- Odds are cached per match to avoid redundant API calls
- When a punter clicks a betting option, odds are fetched if not already loaded

### Odds Display
- **Home Win**: Shows decimal odds (e.g., 2.10)
- **Draw**: Shows decimal odds (e.g., 3.40)
- **Away Win**: Shows decimal odds (e.g., 3.20)
- **Over/Under 2.5**: Shows odds for total goals
- **BTTS (Both Teams To Score)**: Shows Yes/No odds

### Fallback Behavior
If the API key is not configured or the API fails:
- System uses estimated odds (reasonable defaults)
- Punters can still create predictions
- Odds are marked as "estimated"

## Supported Leagues

The API automatically maps leagues:
- **Premier League** → `soccer_epl`
- **Champions League** → `soccer_uefa_champs_league`
- **La Liga** → `soccer_spain_la_liga`
- **Serie A** → `soccer_italy_serie_a`
- **Bundesliga** → `soccer_germany_bundesliga`
- **Ligue 1** → `soccer_france_ligue_one`

## API Endpoint

### GET `/api/sports/odds`

**Query Parameters:**
- `homeTeam` (required): Home team name
- `awayTeam` (required): Away team name
- `league` (optional): League name for better matching

**Response:**
```json
{
  "estimated": false,
  "homeWin": "2.10",
  "draw": "3.40",
  "awayWin": "3.20",
  "over25": "1.85",
  "under25": "1.95",
  "bttsYes": "1.80",
  "bttsNo": "2.00",
  "bookmakerCount": 15,
  "lastUpdate": "2024-04-12T14:30:00Z"
}
```

## Rate Limiting

To avoid hitting rate limits:
- Odds are fetched only for the first 5 visible matches
- Odds are cached per match (no duplicate requests)
- Consider upgrading to a paid plan for high-traffic sites

## Alternative Odds Providers

If you need more requests or different features:

### 1. **API-Football (Odds)**
- Part of RapidAPI
- More comprehensive coverage
- Paid plans available
- [API-Football Odds](https://rapidapi.com/api-sports/api/api-football)

### 2. **Odds API (Premium)**
- Higher rate limits
- More bookmakers
- Historical odds
- [Upgrade Plans](https://the-odds-api.com/#pricing)

### 3. **BetFair API**
- Exchange odds
- Very accurate
- Requires BetFair account
- [BetFair Developer Program](https://developer.betfair.com/)

## Troubleshooting

### Odds showing as "..."
- API key not configured or invalid
- Rate limit exceeded
- Match not found in odds database
- Check browser console for errors

### Estimated odds always showing
- Verify API key is correct in `.env.local`
- Restart development server after adding key
- Check API key hasn't expired

### Team names not matching
- The system includes a team name mapping
- You may need to add more mappings in `src/app/api/sports/odds/route.ts`
- Look for the `TEAM_NAME_MAPPING` object

## Cost Optimization

To minimize API calls:
1. Cache odds in database for 15-30 minutes
2. Only fetch odds when user interacts with a match
3. Use estimated odds for less popular leagues
4. Implement server-side caching with Redis

## Future Enhancements

- [ ] Add odds comparison from multiple bookmakers
- [ ] Show odds movement/trends
- [ ] Calculate accumulator odds automatically
- [ ] Add odds alerts for value bets
- [ ] Historical odds tracking
