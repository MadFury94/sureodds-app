# User Management Update

## Changes Made

### 1. Fixed Approval Error
**Problem**: When clicking "Approve" button, got error "User not found"

**Solution**: Updated the `action` function to pass the user's email to the API endpoint:
```typescript
// Before
async function action(id: string, act: "approve" | "suspend") {
    body: JSON.stringify({ action: act }),
}

// After
async function action(id: string, email: string, act: "approve" | "suspend") {
    body: JSON.stringify({ action: act, email }),
}
```

All button clicks now pass the email:
```typescript
onClick={() => action(user.id, user.email, "approve")}
```

### 2. Added Role-Based Tabs
**New Feature**: Separate tabs to filter users by role

The admin users page now has two levels of filtering:

#### Primary Tabs (Role Filter)
- **All Users** - Shows all users with total count
- **Admin** - Shows only tips-admin users
- **Punters** - Shows only punters with pending count badge
- **Subscribers** - Shows only subscribers with pending count badge

#### Secondary Tabs (Status Filter)
- All
- Pending
- Active
- Suspended

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  USERS                                    [+ Add Punter]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │All Users │ │  Admin   │ │ Punters  │ │Subscribers│       │
│  │   (6)    │ │   (2)    │ │   (1) 🔴 │ │   (3)    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                               │
│  [All] [Pending 1] [Active] [Suspended]                     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ NAME    EMAIL    ROLE    STATUS    ACTIONS            │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Brian   ...      punter  pending   [Approve] [Delete] │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Click on "Punters" tab**: Shows only users with role="punter"
2. **Click on "Subscribers" tab**: Shows only users with role="subscriber"
3. **Click on "Admin" tab**: Shows only users with role="tips-admin"
4. **Click on "All Users" tab**: Shows everyone

The status filters (All, Pending, Active, Suspended) work in combination with the role filter.

### Pending Count Badges

- Red badge on tab shows how many users of that role are pending approval
- Example: "Punters (3) 🔴2" means 3 total punters, 2 pending approval

## Benefits

1. **Easier Navigation**: Quickly find specific user types
2. **Clear Separation**: Punters and subscribers are no longer mixed together
3. **Visual Indicators**: Pending counts show at a glance what needs attention
4. **Fixed Bug**: Approval button now works correctly

## Testing

To test the changes:
1. Go to `/admin-dashboard/users`
2. Click on different role tabs to filter users
3. Click "Approve" on a pending user - should work without errors
4. Check that pending count badges update correctly
