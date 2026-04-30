# Bet Codes Sharing System with Categories & Access Control

## Overview
A complete system for punters to share bet codes with subscribers, featuring category-based access control where some categories are free and others require subscription.

## Categories

### 1. **Free** 🆓
- **Access**: Everyone (logged in or not)
- **Purpose**: Public tips to attract new users
- **Color**: Green (#22c55e)

### 2. **Sure Banker** 🏦
- **Access**: All logged-in users
- **Purpose**: High confidence picks for registered members
- **Color**: Orange (#ff6b00)

### 3. **Premium** ⭐
- **Access**: Premium subscribers only
- **Purpose**: Exclusive tips for paying members
- **Color**: Purple (#8b5cf6)
- **Note**: Currently shows to logged-in users (TODO: Add subscription check)

### 4. **VIP** 👑
- **Access**: VIP subscribers only
- **Purpose**: Top-tier exclusive picks
- **Color**: Gold (#eab308)
- **Note**: Currently shows to logged-in users (TODO: Add subscription check)

## User Flow

### For Punters (Creating Bet Codes):

1. **Navigate** to `/dashboard/punter/bet-codes`
2. **Click** "Share Bet Code" button
3. **Fill Form**:
   - Bookmaker (required)
   - Booking Code (optional if link/image provided)
   - Bet Slip Link (optional)
   - Bet Slip Image URL (optional)
   - Description
   - **Category** (required) - Select from 4 visual cards
   - **Confidence Level** (required) - Low, Medium, High, Banker
   - Total Odds
   - Recommended Stake
   - Expiration Date
4. **Submit** - Bet code is created with category and confidence
5. **Manage** - View all your bet codes, delete your own

### For Subscribers (Viewing Bet Codes):

1. **Navigate** to `/bet-codes` (public page)
2. **View Access**:
   - **Not logged in**: See only "Free" category
   - **Logged in**: See "Free" + "Sure Banker" (+ Premium/VIP if subscribed)
3. **Filter** by category using top navigation
4. **View Details**:
   - Booking code (copy-paste ready)
   - Direct link to bet slip
   - Image of bet slip
   - Description and analysis
   - Odds and recommended stake
   - Confidence level badge
   - Category badge
   - Expiration time
5. **Login Prompt**: If not logged in, see "Login to See More" button

## API Endpoints

### GET `/api/bet-codes`
**Purpose**: Fetch bet codes with access control

**Authentication**: Optional (affects what's returned)

**Access Control Logic**:
```typescript
- Not logged in → Only "free" category
- Logged in (regular user) → "free" + "sure-banker"
- Logged in (premium subscriber) → "free" + "sure-banker" + "premium"
- Logged in (VIP subscriber) → All categories
- Admin → All categories
```

**Response**:
```json
{
  "betCodes": [...],
  "userRole": "guest" | "punter" | "admin",
  "totalCount": 50,
  "visibleCount": 10
}
```

### POST `/api/bet-codes`
**Purpose**: Create new bet code

**Authentication**: Required (user or admin session)

**Required Fields**:
- `bookmaker` (string)
- `category` (string: "free" | "sure-banker" | "premium" | "vip")
- At least one of: `code`, `link`, or `image`

**Optional Fields**:
- `description`, `odds`, `stake`, `expiresAt`, `confidence`

**Response**:
```json
{
  "betCode": {
    "id": "1234567890",
    "bookmaker": "Bet9ja",
    "code": "ABC123XYZ",
    "category": "sure-banker",
    "confidence": "High",
    "createdBy": "user@example.com",
    "createdAt": "2026-04-29T...",
    ...
  }
}
```

### DELETE `/api/bet-codes/[id]`
**Purpose**: Delete a bet code

**Authentication**: Required

**Authorization**:
- Users can delete their own bet codes
- Admins can delete any bet code

### PATCH `/api/bet-codes/[id]`
**Purpose**: Update bet code status (active/won/lost/expired)

**Authentication**: Admin only

## Data Structure

```typescript
interface BetCode {
  id: string;
  bookmaker: string;
  code: string;
  link?: string;
  image?: string;
  description: string;
  odds: string;
  stake?: string;
  expiresAt: string;
  createdAt: string;
  status: "active" | "expired" | "won" | "lost";
  createdBy: string;
  createdByEmail?: string;
  category: "free" | "sure-banker" | "premium" | "vip";
  confidence?: "Low" | "Medium" | "High" | "Banker";
}
```

## Pages

### 1. `/dashboard/punter/bet-codes` (Punter Dashboard)
- **Access**: Authenticated punters only
- **Features**:
  - Create new bet codes with category selection
  - View all your bet codes
  - Delete your own bet codes
  - Visual category selector (4 cards with icons)
  - Confidence level dropdown

### 2. `/bet-codes` (Public Page)
- **Access**: Everyone (content filtered by auth status)
- **Features**:
  - Category filter tabs
  - Responsive grid layout
  - Category badges on each card
  - Confidence level badges
  - Login prompt for guests
  - Direct links to bet slips
  - Copy-ready booking codes

## UI Components

### Category Selector (Form)
- 2x2 grid of visual cards
- Each card shows:
  - Icon (emoji)
  - Category name
  - Description
  - Selected state (orange border + background)

### Bet Code Card (Public Page)
- Category badge (top-right)
- Bookmaker name
- Timestamp
- Confidence badge
- Booking code (large, monospace)
- Link button (if available)
- Image (if available)
- Description
- Odds and stake display
- Expiration time

## Access Control Implementation

### Current Implementation:
```typescript
// In GET /api/bet-codes
if (!user) {
  // Guest - only free
  filteredCodes = betCodes.filter(bc => bc.category === "free");
} else if (user.role === "admin") {
  // Admin - everything
  filteredCodes = betCodes;
} else {
  // Logged in user - free + sure-banker
  filteredCodes = betCodes.filter(bc => 
    bc.category === "free" || 
    bc.category === "sure-banker"
  );
}
```

### TODO: Add Subscription Checking
To implement proper subscription-based access:

1. **Add subscription field to user model**:
```typescript
interface User {
  ...
  subscription: "free" | "premium" | "vip";
}
```

2. **Update access control logic**:
```typescript
const accessMap = {
  free: ["free"],
  premium: ["free", "sure-banker", "premium"],
  vip: ["free", "sure-banker", "premium", "vip"],
};

const allowedCategories = accessMap[user.subscription] || ["free"];
filteredCodes = betCodes.filter(bc => 
  allowedCategories.includes(bc.category)
);
```

3. **Add subscription management**:
- Payment integration (Paystack, Flutterwave)
- Subscription plans page
- User subscription status in profile
- Subscription expiry handling

## Security Features

✅ **Authentication**:
- JWT token verification for user sessions
- Admin session cookie verification
- Proper error messages for unauthorized access

✅ **Authorization**:
- Users can only delete their own bet codes
- Admins can delete any bet code
- Only admins can update bet code status

✅ **Data Validation**:
- Required fields validation
- Category validation (only allowed values)
- At least one of code/link/image required

## Testing Checklist

### As Punter:
- [ ] Create bet code with each category
- [ ] Create bet code with each confidence level
- [ ] View all your bet codes
- [ ] Delete your own bet code
- [ ] Cannot delete other punters' bet codes

### As Guest (Not Logged In):
- [ ] Visit `/bet-codes`
- [ ] See only "Free" category bet codes
- [ ] See "Login to See More" button
- [ ] Cannot see Sure Banker, Premium, or VIP codes

### As Logged-In User:
- [ ] Visit `/bet-codes`
- [ ] See "Free" and "Sure Banker" categories
- [ ] Filter by category
- [ ] Copy booking codes
- [ ] Open bet slip links
- [ ] View bet slip images

### As Admin:
- [ ] See all categories
- [ ] Delete any bet code
- [ ] Update bet code status

## Future Enhancements

1. **Subscription System**:
   - Payment integration
   - Subscription plans (Monthly/Yearly)
   - Auto-renewal
   - Subscription status in user profile

2. **Analytics**:
   - Track bet code views
   - Track booking code copies
   - Win/loss tracking
   - Punter performance metrics

3. **Notifications**:
   - Email alerts for new bet codes
   - Push notifications for premium subscribers
   - Expiry reminders

4. **Social Features**:
   - Like/favorite bet codes
   - Comments and discussions
   - Follow favorite punters
   - Share to social media

5. **Advanced Filtering**:
   - Filter by bookmaker
   - Filter by odds range
   - Filter by confidence level
   - Sort by date, odds, confidence

## File Changes Summary

### New Files:
- `src/app/bet-codes/page.tsx` - Public bet codes viewing page

### Modified Files:
- `src/app/api/bet-codes/route.ts` - Added category, confidence, access control
- `src/app/api/bet-codes/[id]/route.ts` - Updated auth to allow user ownership
- `src/app/dashboard/punter/bet-codes/page.tsx` - Added category selector and confidence field

### Data Structure:
- `src/data/bet-codes.json` - Now includes `category` and `confidence` fields
