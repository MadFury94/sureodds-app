# User Roles System - Sureodds

## Overview

Your app has a complete user authentication and role-based access control system with three distinct user roles.

---

## User Roles

### 1. Subscriber (Default)
**Role:** `"subscriber"`

**Permissions:**
- ✅ Can register and create an account
- ✅ Can view free content (news articles, match info)
- ✅ Can see preview of betting tips (first 2 tips)
- ❌ Cannot access full betting tips
- ❌ Needs to upgrade to access premium content

**Status:** `"pending"` until subscription is activated

**Use Case:** Free users who want to explore the platform

---

### 2. Punter (Premium User)
**Role:** `"punter"`

**Permissions:**
- ✅ Full access to all betting tips
- ✅ Can view all premium content
- ✅ Access to expert predictions
- ✅ Filter tips by league
- ✅ View confidence levels and analysis
- ✅ Access to dashboard

**Status:** `"active"` with valid `subscriptionExpiry` date

**Use Case:** Paying customers who subscribe for betting tips

---

### 3. Tips Admin
**Role:** `"tips-admin"`

**Permissions:**
- ✅ All punter permissions
- ✅ Can create, edit, delete betting tips
- ✅ Access to admin dashboard (`/admin-dashboard/tips`)
- ✅ Can approve/reject user subscriptions
- ✅ Can manage user accounts
- ✅ View analytics and reports

**Status:** Always `"active"`

**Use Case:** Staff members who manage betting tips and users

---

## User Status

### Pending
- New user who just registered
- Waiting for subscription payment
- Limited access to content

### Active
- Subscription is active
- Full access based on role
- Can access premium features

### Suspended
- Account temporarily disabled
- Cannot access any premium features
- Needs admin intervention

---

## Access Control Logic

### Betting Tips Page (`/betting`)

```typescript
// Check if user has active subscription
const isSubscriber = authChecked && 
    user?.status === "active" &&
    (!user.subscriptionExpiry || new Date(user.subscriptionExpiry) > new Date());

// Free users see 2 tips (preview)
const PREVIEW_COUNT = 2;
const visibleTips = isSubscriber ? tips : tips.slice(0, PREVIEW_COUNT);
```

**Access Levels:**
- **Not logged in:** See 2 preview tips (blurred)
- **Subscriber (pending):** See 2 preview tips (blurred)
- **Punter (active):** See all tips (full access)
- **Tips Admin:** See all tips + can manage them

---

## User Data Structure

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: "subscriber" | "punter" | "tips-admin";
    status: "pending" | "active" | "suspended";
    subscriptionExpiry: string | null;  // ISO date string
    paymentMethod: "online" | "manual" | null;
    paymentRef: string | null;
    proofUrl: string | null;
    createdAt: string;
    approvedAt: string | null;
    approvedBy: string | null;
}
```

---

## Authentication Flow

### Registration
1. User fills registration form (`/register`)
2. Account created with role: `"subscriber"`, status: `"pending"`
3. User redirected to subscription page (`/subscribe`)
4. User chooses payment method and subscribes
5. Admin approves subscription
6. User status changed to `"active"`, role upgraded to `"punter"`

### Login
1. User enters email and password (`/login`)
2. System verifies credentials
3. JWT token created with user session
4. User redirected based on role:
   - `tips-admin` → `/admin-dashboard/tips`
   - `punter` or `subscriber` → `/dashboard`

### Session Management
- JWT token stored in HTTP-only cookie
- Token expires after 30 days
- Middleware checks authentication on protected routes

---

## Protected Routes

### Public Routes (No Auth Required)
- `/` - Homepage
- `/category/*` - League pages
- `/article/*` - News articles
- `/match/*` - Match details
- `/team/*` - Team pages
- `/login` - Login page
- `/register` - Registration page

### User Routes (Auth Required)
- `/dashboard` - User dashboard
- `/dashboard/profile` - User profile
- `/betting` - Betting tips (limited for free users)
- `/subscribe` - Subscription page

### Admin Routes (Tips Admin Only)
- `/admin-dashboard/*` - Admin dashboard
- `/admin-dashboard/tips` - Manage tips
- `/admin-dashboard/accounts` - Manage users

---

## Subscription System

### Payment Methods
1. **Online Payment** - Automated via payment gateway
2. **Manual Payment** - Bank transfer with proof upload

### Subscription Flow
1. User selects subscription plan
2. User chooses payment method
3. If online: Payment processed automatically
4. If manual: User uploads payment proof
5. Admin reviews and approves
6. User role upgraded to `"punter"`
7. `subscriptionExpiry` date set

### Expiry Handling
- System checks `subscriptionExpiry` date
- If expired: User loses access to premium tips
- User sees "Subscription Expired" message
- User can renew subscription

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Tips
- `GET /api/tips` - Get all tips (filtered by user role)
- `POST /api/tips` - Create tip (admin only)
- `PUT /api/tips/[id]` - Update tip (admin only)
- `DELETE /api/tips/[id]` - Delete tip (admin only)

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `PUT /api/admin/users/[id]` - Update user (admin only)

---

## Upgrading User Roles

### Subscriber → Punter
**When:** User subscribes and payment is approved

**How:**
```typescript
await updateUser(userId, {
    role: "punter",
    status: "active",
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    approvedAt: new Date().toISOString(),
    approvedBy: adminId,
});
```

### Punter → Tips Admin
**When:** Admin manually promotes a user

**How:**
```typescript
await updateUser(userId, {
    role: "tips-admin",
    status: "active",
    subscriptionExpiry: null, // Admins don't expire
});
```

---

## Security Features

1. **Password Hashing** - bcrypt with 12 rounds
2. **JWT Tokens** - Signed with HS256 algorithm
3. **HTTP-Only Cookies** - Prevents XSS attacks
4. **Middleware Protection** - Checks auth on protected routes
5. **Role-Based Access** - Enforced at API and page level

---

## File Locations

### Core Files
- `src/lib/auth.ts` - Authentication logic and user management
- `src/middleware.ts` - Route protection middleware
- `src/data/users.json` - User database (file-based)

### Pages
- `src/app/register/page.tsx` - Registration
- `src/app/login/page.tsx` - Login
- `src/app/dashboard/` - User dashboard
- `src/app/betting/page.tsx` - Betting tips
- `src/app/admin-dashboard/` - Admin dashboard

### API Routes
- `src/app/api/auth/` - Authentication endpoints
- `src/app/api/tips/` - Tips management
- `src/app/api/admin/` - Admin endpoints

---

## Summary

✅ **You have a complete user role system with "punter" role**

The system includes:
- Three distinct roles (subscriber, punter, tips-admin)
- Status management (pending, active, suspended)
- Subscription expiry tracking
- Role-based access control
- Secure authentication with JWT
- Payment approval workflow

The "punter" role is specifically for premium users who have active subscriptions and can access all betting tips.
