# User Status Refresh Issue - Fixed

## Problem
When admin approves a user, the status changes to "active" in the UI. However, after refreshing the page, the user appears as "pending" again, even though they can still access the dashboard.

## Root Cause
The issue had multiple contributing factors:

### 1. WordPress API Caching
- WordPress REST API responses were being cached
- When refreshing the page, cached data was returned
- The updated `user_status` meta field wasn't being fetched

### 2. Status Logic Inconsistency
- The `readUsers()` function had a fallback that would mark users as "active" if they had certain roles
- This fallback was overriding the explicit `user_status` meta field
- New users with "subscriber" role but no `user_status` were being marked as "active" incorrectly

### 3. Session Token vs Database Status
- User's JWT token contained the old "pending" status
- The `/api/auth/me` endpoint was using token status instead of database status
- This caused confusion between what the admin sees and what the user experiences

## Solutions Applied

### 1. Added Cache-Busting to WordPress API Calls
**File:** `src/lib/auth-wordpress.ts`

Added timestamp-based cache busting and cache control headers:
```typescript
const timestamp = Date.now();
const res = await fetch(`${WP_API}/users?per_page=100&context=edit&_=${timestamp}`, {
    headers: { 
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
});
```

### 2. Fixed Status Logic Priority
**File:** `src/lib/auth-wordpress.ts`

Changed the status determination logic to prioritize explicit `user_status` meta field:

**Before:**
```typescript
const status = wpUser.meta?.user_status || (roles check ? "active" : "pending");
```

**After:**
```typescript
let status: UserStatus = "pending";

if (wpUser.meta?.user_status) {
    // Use the explicit user_status meta field (highest priority)
    status = wpUser.meta.user_status;
} else if (wpUser.roles?.includes("administrator") || ...) {
    // Existing WordPress users with elevated roles
    status = "active";
} else if (wpUser.roles?.includes("subscriber") && !wpUser.meta?.user_status) {
    // Legacy subscribers without explicit status
    status = "active";
} else {
    // New users default to pending
    status = "pending";
}
```

### 3. Updated /api/auth/me to Use WordPress Status
**File:** `src/app/api/auth/me/route.ts`

Changed to use WordPress database status as source of truth, with exception for magic link access:

```typescript
// Use WordPress status as source of truth
let finalStatus = user.status;

// Exception: Magic link scenario
if (payload.status === "active" && user.status === "pending") {
    console.log("🔐 Magic link access detected - allowing temporary active status");
    finalStatus = "active";
}
```

This ensures:
- Admin sees the correct status after approval
- User with old session token gets updated status from database
- Magic link still works for first-time access

## How It Works Now

### Approval Flow
1. Admin clicks "Approve" on pending user
2. WordPress user meta `user_status` is set to "active"
3. Magic link email is sent to user
4. Admin dashboard updates immediately (local state)
5. On page refresh, fresh data is fetched from WordPress (no cache)
6. User status shows as "active" correctly

### User Access Flow
1. User logs in with OTP (old session has "pending" status)
2. `/api/auth/me` fetches fresh data from WordPress
3. WordPress returns `user_status = "active"`
4. User gets access to dashboard with correct status

### Magic Link Flow
1. User clicks magic link from approval email
2. Magic link creates session with `status = "active"`
3. `/api/auth/me` detects magic link scenario
4. Allows temporary "active" status even if WordPress still shows "pending"
5. This handles race conditions where email is sent before WordPress updates

## Testing the Fix

### Test 1: Approve User and Refresh
1. Go to admin dashboard users page
2. Find a pending user
3. Click "Approve"
4. User should show as "active"
5. Refresh the page (F5 or Ctrl+R)
6. User should still show as "active" ✅

### Test 2: User Login After Approval
1. Admin approves a user
2. User logs in with OTP
3. User should have access to dashboard
4. User status should be "active"

### Test 3: Magic Link Access
1. Admin approves a user
2. User receives magic link email
3. User clicks magic link
4. User should have immediate access to dashboard
5. Future logins should work normally

## Server Console Logs

When you approve a user, watch for these logs:

```
📝 [updateUser] Updating WordPress user: 123
📝 [updateUser] Updates: { "status": "active", ... }
📝 [updateUser] Setting user_status to: active
✅ [updateUser] WordPress response: { id: 123, meta: { user_status: "active" } }
```

When you refresh the users page:

```
📋 [readUsers] Fetching all users from WordPress...
📋 [readUsers] WordPress returned 7 users
📋 [readUsers] User user@example.com: Using meta.user_status = active
```

## Files Modified
- ✅ `src/lib/auth-wordpress.ts` - Fixed status logic, added cache-busting
- ✅ `src/app/api/auth/me/route.ts` - Use WordPress status as source of truth
- ✅ `src/app/admin-dashboard/users/page.tsx` - Already had cache-busting

## Potential Issues

### If Status Still Shows Pending After Refresh

**Check WordPress Meta Field:**
1. Log into WordPress admin panel
2. Go to Users → All Users
3. Click on the user
4. Scroll to "Custom Fields" section
5. Look for `user_status` field
6. Should show "active"

**If meta field is not saved:**
- Check WordPress REST API permissions
- Verify `WP_ADMIN_USER` and `WP_ADMIN_PASSWORD` are correct
- Check server console for WordPress API errors

**Check Server Console:**
Look for these error messages:
```
❌ [updateUser] WordPress API error: ...
```

### If Magic Link Doesn't Work

Check that:
1. Magic link token is valid (24-hour expiry)
2. Email was sent successfully
3. User clicks the link within 24 hours
4. `/api/auth/magic` endpoint is working

## Next Steps

If you still experience issues:
1. Check server console logs when approving a user
2. Check server console logs when refreshing the page
3. Verify WordPress meta fields are being saved
4. Share any error messages you see
