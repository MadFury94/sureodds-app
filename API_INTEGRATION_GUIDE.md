# SportAPI Integration Guide

## ✅ API Status: WORKING

The SportAPI from RapidAPI is successfully integrated and tested.

## 🎯 New Features

### Head-to-Head Analysis
We've added creative H2H features across the app:

1. **Expandable H2H in Fixtures** - Click to reveal historical matchups directly in upcoming fixtures
2. **Dedicated H2H Page** (`/h2h`) - Full analysis page with stats, win/loss records, and match history
3. **Visual Stats** - Win percentages, average goals, and recent form

## Configuration

### Environment Variables (.env.local)
```env
RAPIDAPI_KEY=d9bfe10bf0msh72b2a653ecfde67p160769jsnb1550a1600a6
RAPIDAPI_HOST=sportapi7.p.rapidapi.com
```

⚠️ **Security Note**: Regenerate your API key since it was exposed in screenshots.

## Available Endpoints

### 1. Head-to-Head Events ✅ TESTED
Get historical matches between two teams.

**API Route**: `/api/sports/h2h?eventId={customId}`

**Example**:
```bash
curl http://localhost:3000/api/sports/h2h?eventId=xdbsZdb
```

**Response**: Returns array of past matches with scores, teams, tournaments, etc.

**Usage in Code**:
```typescript
import { sportAPI } from '@/lib/sportapi';

const h2hData = await sportAPI.getHead2HeadEvents('xdbsZdb');
```

## Components

### HeadToHead Component
Expandable H2H widget that can be embedded in any fixture card:

```tsx
import HeadToHead from '@/components/HeadToHead';

<HeadToHead
  eventId="xdbsZdb"
  homeTeam="Bayern München"
  awayTeam="Lazio"
  color="#ff6b00"
/>
```

Features:
- Expandable/collapsible interface
- Win/draw/loss statistics
- Last 5 meetings with scores
- Tournament and date info
- Loading states and error handling

## Pages

### 1. Test API Page (`/test-api`)
Simple test interface for the H2H endpoint.

### 2. H2H Analysis Page (`/h2h`)
Full-featured head-to-head analysis page with:
- Event ID search
- Team comparison header
- Win/loss statistics
- Average goals analysis
- Complete match history
- Beautiful visual design matching your app

## Integration Points

The H2H feature is integrated in:

1. **Category Pages** - Upcoming fixtures now have expandable H2H sections
2. **Betting Tips** - Can be added to tip cards for context
3. **Standalone Page** - `/h2h` for detailed analysis

## API Client Methods

The `SportAPIClient` class in `src/lib/sportapi.ts` provides these methods:

- `getCategories()` - Get list of sport categories
- `getLiveCategories()` - Get live sport categories
- `getCurrentLiveEvents()` - Get current live events
- `getScheduledEvents(date: string)` - Get events scheduled for a date
- `getHead2HeadEvents(eventId: string)` - Get H2H events ✅
- `getEventDetails(eventId: string)` - Get detailed event info
- `getTournamentsOnDate(date: string)` - Get tournaments on a date
- `getOddsForDate(date: string)` - Get odds for events on a date

## Next Steps

1. **Get Event IDs** - You'll need to find a way to get event IDs for upcoming matches
   - Check if SportAPI has an endpoint for upcoming fixtures
   - Or use another API to get fixture IDs

2. **Add to More Pages** - Integrate H2H into:
   - Home page featured matches
   - Betting tips page
   - Team pages

3. **Cache Results** - Add caching to reduce API calls:
   ```typescript
   next: { revalidate: 3600 } // Cache for 1 hour
   ```

4. **Add More Stats** - Enhance with:
   - Home vs Away records
   - Goals scored/conceded trends
   - Recent form (last 5 games)
   - Betting odds history

5. **Regenerate API Key** - For security

## Example: Getting Match Data

```typescript
// In a server component or API route
import { sportAPI } from '@/lib/sportapi';

export async function GET() {
  try {
    // Get H2H data for a specific match
    const h2hData = await sportAPI.getHead2HeadEvents('xdbsZdb');
    
    // Process the data
    const matches = h2hData.events.map(event => ({
      homeTeam: event.homeTeam.name,
      awayTeam: event.awayTeam.name,
      score: `${event.homeScore.display} - ${event.awayScore.display}`,
      tournament: event.tournament.name,
      date: new Date(event.startTimestamp * 1000).toLocaleDateString()
    }));
    
    return Response.json({ matches });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

## Troubleshooting

### 403 Forbidden Error
- Make sure you're subscribed to the API in RapidAPI
- Check that your API key is correct
- Verify the endpoint URL matches RapidAPI documentation

### Module Not Found Error
- Ensure files are in `src/lib/` not `lib/`
- Check tsconfig.json has correct path aliases

### Environment Variables Not Loading
- Restart the dev server after changing .env.local
- Make sure .env.local is in the project root
- Don't commit .env.local to git (it's in .gitignore)

### Event ID Not Found
- The event ID (customId) must be from a valid match
- Try the example ID: `xdbsZdb` (Bayern vs Lazio)
- Check RapidAPI docs for how to get event IDs
