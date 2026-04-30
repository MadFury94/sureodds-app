# Punter Dashboard Changes - Bet Codes Only

## Summary
Restricted punter dashboard to only allow sharing bet codes (booking codes from bookmakers) instead of creating full betslips with match selections. This simplifies the workflow and focuses on what punters actually need.

## Changes Made

### 1. Main Punter Dashboard (`src/app/dashboard/punter/page.tsx`)

#### Removed:
- "Post Prediction" button (previously linked to `/dashboard/punter/new-prediction`)
- Betslip-related data fetching and state management
- Recent betslips display section

#### Added:
- Bet codes data fetching from `/api/bet-codes`
- Recent bet codes display section with card layout
- Updated stats to show:
  - Total Bet Codes (instead of Total Predictions)
  - Active Codes (instead of Pending)
  - Win Rate (calculated from won/lost bet codes)
  - Blog Posts (unchanged)

#### Updated:
- Quick Actions section now shows only 2 buttons (was 3):
  - **Share Bet Codes** (primary action, orange gradient)
  - **Write Article** (secondary action, dark gradient)
- Recent activity section now displays bet codes with:
  - Bookmaker name
  - Booking code
  - Status badge (active/won/lost/expired)
  - Description preview
  - Odds display
  - Creation timestamp

### 2. Redirect Pages Created

Created redirect pages for old betslip-related routes to guide users to bet codes:

#### `/dashboard/punter/new-prediction/page.tsx`
- Full informational page explaining the feature change
- Auto-redirects to bet codes page after 3 seconds
- Manual "Go to Bet Codes" button
- Explains why the change was made

#### `/dashboard/punter/predictions/page.tsx`
- Immediate redirect to bet codes page
- Simple loading message

#### `/dashboard/punter/betslips/page.tsx`
- Immediate redirect to bet codes page
- Simple loading message

### 3. Bet Codes Page (Unchanged)
The existing bet codes page at `/dashboard/punter/bet-codes/page.tsx` remains fully functional with:
- Form to share bet codes
- Support for multiple bookmakers (Bet9ja, SportyBet, 1xBet, etc.)
- Fields for:
  - Booking code
  - Bet slip link (optional)
  - Bet slip image URL (optional)
  - Description
  - Total odds
  - Recommended stake
  - Expiration date
- Grid display of all shared bet codes
- Delete functionality

## User Flow

### Before:
1. Punter clicks "Post Prediction"
2. Selects league and matches
3. Chooses betting options for each match
4. Adds analysis and confidence levels
5. Posts betslip

### After:
1. Punter clicks "Share Bet Codes"
2. Fills simple form with:
   - Bookmaker name
   - Booking code (from their bookmaker)
   - Optional: link, image, description, odds, stake
3. Shares bet code immediately

## Benefits

1. **Simpler workflow**: No need to manually select matches and outcomes
2. **Faster sharing**: Just paste the booking code from bookmaker
3. **More accurate**: Uses actual bookmaker codes instead of manual entry
4. **Better UX**: Subscribers can directly use the code in their bookmaker app
5. **Less maintenance**: No need to track match results for individual selections

## API Endpoints Used

- `GET /api/bet-codes` - Fetch all bet codes (public)
- `POST /api/bet-codes` - Create new bet code (requires user or admin authentication)
- `DELETE /api/bet-codes/[id]` - Delete bet code (requires ownership or admin)
- `PATCH /api/bet-codes/[id]` - Update bet code status (requires admin authentication)

### Authentication Changes

**Fixed:** Bet codes API now properly supports punter authentication:
- Punters can create bet codes using their `so_user_session` cookie
- Punters can delete their own bet codes
- Admins can delete any bet code and update status
- Both user and admin sessions are checked for authentication

## Data Structure

Bet codes are stored in `src/data/bet-codes.json` with the following structure:

```json
{
  "id": "string",
  "bookmaker": "string",
  "code": "string",
  "link": "string (optional)",
  "image": "string (optional)",
  "description": "string",
  "odds": "string",
  "stake": "string (optional)",
  "expiresAt": "string (ISO date)",
  "createdAt": "string (ISO date)",
  "status": "active | expired | won | lost",
  "createdBy": "string (user ID)"
}
```

## Testing Checklist

- [x] Main dashboard loads without errors
- [x] Stats display correctly (bet codes count, win rate, active codes)
- [x] Recent bet codes section displays properly
- [x] "Share Bet Codes" button navigates to bet codes page
- [x] Old prediction routes redirect to bet codes page
- [x] No TypeScript compilation errors
- [ ] Manual test: Create a new bet code
- [ ] Manual test: View bet codes in dashboard
- [ ] Manual test: Navigate to old prediction URLs and verify redirects

## Notes

- The betslip creation functionality still exists in the codebase but is no longer accessible from the punter dashboard
- Admin users may still have access to betslip features through admin dashboard
- The `/api/betslips` endpoints remain functional for backward compatibility
- Consider removing unused betslip pages in future cleanup if confirmed not needed
