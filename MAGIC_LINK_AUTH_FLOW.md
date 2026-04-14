# Magic Link Authentication Flow

## Overview
The system now uses a combination of OTP (One-Time Password) and Magic Links for authentication:
- **Registration**: OTP verification
- **First Login After Approval**: Magic link (one-time, 24-hour expiry)
- **Subsequent Logins**: OTP verification

## User Flows

### 1. Punter Registration & Approval Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. REGISTRATION                                              │
├─────────────────────────────────────────────────────────────┤
│ • User selects "Punter" account type                        │
│ • Enters name and email                                      │
│ • Receives OTP code via email                               │
│ • Verifies OTP                                               │
│ • Account created with status: "pending"                    │
│ • Redirected to /register/pending                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ADMIN NOTIFICATION                                        │
├─────────────────────────────────────────────────────────────┤
│ • Admin receives email: "New Punter Registration"           │
│ • Email contains link to admin dashboard                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ADMIN APPROVAL                                            │
├─────────────────────────────────────────────────────────────┤
│ • Admin logs into /admin-dashboard/users                    │
│ • Clicks "Approve" button for punter                        │
│ • System generates magic link token                         │
│ • User status updated to "active"                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. APPROVAL EMAIL WITH MAGIC LINK                           │
├─────────────────────────────────────────────────────────────┤
│ • Punter receives email: "Punter Account Activated"         │
│ • Email contains magic link button                          │
│ • Link format: /auth/magic?token=xxxxx                      │
│ • Link expires in 24 hours                                   │
│ • Can only be used once                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. FIRST LOGIN (MAGIC LINK)                                 │
├─────────────────────────────────────────────────────────────┤
│ • User clicks magic link in email                           │
│ • System verifies token                                      │
│ • Creates session automatically                             │
│ • Redirects to /dashboard/punter                            │
│ • Magic link marked as "used"                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SUBSEQUENT LOGINS (OTP)                                   │
├─────────────────────────────────────────────────────────────┤
│ • User goes to /login                                        │
│ • Enters email                                               │
│ • Receives OTP code                                          │
│ • Verifies OTP                                               │
│ • Redirected to /dashboard/punter                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Subscriber Registration & Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. REGISTRATION                                              │
├─────────────────────────────────────────────────────────────┤
│ • User selects "Subscriber" account type                    │
│ • Enters name and email                                      │
│ • Receives OTP code via email                               │
│ • Verifies OTP                                               │
│ • Account created with status: "pending"                    │
│ • Receives welcome email                                     │
│ • Redirected to /subscribe (payment page)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PAYMENT                                                   │
├─────────────────────────────────────────────────────────────┤
│ Option A: Online Payment (Paystack)                         │
│ • User clicks "Pay Online"                                   │
│ • Redirected to Paystack checkout                           │
│ • Completes payment                                          │
│ • System auto-verifies payment                              │
│                                                              │
│ Option B: Bank Transfer                                      │
│ • User views bank account details                           │
│ • Makes bank transfer                                        │
│ • Uploads payment proof                                      │
│ • Submits payment reference                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ADMIN NOTIFICATION                                        │
├─────────────────────────────────────────────────────────────┤
│ • Admin receives email: "New Payment Submission"            │
│ • Email contains payment reference and proof                │
│ • Email contains link to admin dashboard                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ADMIN APPROVAL                                            │
├─────────────────────────────────────────────────────────────┤
│ • Admin logs into /admin-dashboard/users                    │
│ • Verifies payment proof                                     │
│ • Clicks "Approve" button for subscriber                    │
│ • System generates magic link token                         │
│ • User status updated to "active"                           │
│ • Subscription expiry date set                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. APPROVAL EMAIL WITH MAGIC LINK                           │
├─────────────────────────────────────────────────────────────┤
│ • Subscriber receives email: "Subscription Activated"       │
│ • Email shows subscription expiry date                      │
│ • Email contains magic link button                          │
│ • Link format: /auth/magic?token=xxxxx                      │
│ • Link expires in 24 hours                                   │
│ • Can only be used once                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. FIRST LOGIN (MAGIC LINK)                                 │
├─────────────────────────────────────────────────────────────┤
│ • User clicks magic link in email                           │
│ • System verifies token                                      │
│ • Creates session automatically                             │
│ • Redirects to /dashboard                                   │
│ • Magic link marked as "used"                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. SUBSEQUENT LOGINS (OTP)                                   │
├─────────────────────────────────────────────────────────────┤
│ • User goes to /login                                        │
│ • Enters email                                               │
│ • Receives OTP code                                          │
│ • Verifies OTP                                               │
│ • Redirected to /dashboard                                  │
└─────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Magic Link System

**File**: `src/lib/magic-link.ts`

Features:
- Generates secure random tokens (64 characters)
- Stores token data in memory (email, role, timestamp)
- 24-hour expiration
- One-time use only
- Automatic cleanup of expired links

### API Endpoints

#### 1. `/api/auth/magic` (GET)
- Verifies magic link token
- Finds user by email
- Creates session
- Redirects to appropriate dashboard
- Marks token as used

#### 2. `/api/admin/users/[id]` (POST)
- Approves user (punter or subscriber)
- Generates magic link token
- Sends approval email with magic link
- Updates user status to "active"

### Email Templates

#### Approval Email (with Magic Link)
- Subject: "✅ Account Activated"
- Contains one-time magic link button
- Shows subscription expiry (subscribers only)
- Explains link expires in 24 hours
- Provides regular login URL for future use

#### Welcome Email (Subscribers)
- Subject: "Welcome to Sureodds — Complete Your Payment"
- Directs to payment page
- Explains approval process

## Security Features

1. **Token Security**
   - 256-bit random tokens
   - Cryptographically secure generation
   - No predictable patterns

2. **Expiration**
   - 24-hour validity window
   - Automatic cleanup of expired tokens

3. **One-Time Use**
   - Token marked as "used" after first access
   - Cannot be reused even within 24 hours

4. **Session Management**
   - HTTP-only cookies
   - Secure flag in production
   - 30-day session duration

## User Experience Benefits

1. **Frictionless First Login**
   - No need to remember password
   - One click from email to dashboard
   - Immediate access after approval

2. **Secure Subsequent Logins**
   - OTP sent to email
   - No password to forget
   - Fresh code each time

3. **Clear Communication**
   - Users know exactly what to expect
   - Email explains next steps
   - Magic link clearly labeled as one-time

## Admin Dashboard

### Users Page Features

**Role Tabs**:
- All Users
- Admin (tips-admin)
- Punters (with pending count)
- Subscribers (with pending count)

**Status Filters**:
- All
- Pending
- Active
- Suspended

**Actions**:
- Approve (generates magic link)
- Suspend
- Delete

## Testing

### Test Punter Flow
1. Register as punter at `/register`
2. Verify OTP
3. Check admin email for notification
4. Admin approves at `/admin-dashboard/users`
5. Check punter email for magic link
6. Click magic link → should redirect to `/dashboard/punter`
7. Logout and login again → should use OTP

### Test Subscriber Flow
1. Register as subscriber at `/register`
2. Verify OTP → redirected to `/subscribe`
3. Submit payment (online or manual)
4. Check admin email for payment notification
5. Admin approves at `/admin-dashboard/users`
6. Check subscriber email for magic link
7. Click magic link → should redirect to `/dashboard`
8. Logout and login again → should use OTP

## Environment Variables

No additional environment variables needed. Uses existing:
- `NEXT_PUBLIC_APP_URL` - For magic link URLs
- `RESEND_API_KEY` or Gmail SMTP - For sending emails
- `JWT_SECRET` - For session tokens

## Future Enhancements

1. **Redis Storage**: Replace in-memory storage with Redis for production scalability
2. **Link Analytics**: Track magic link click rates
3. **Custom Expiry**: Allow admin to set custom expiry times
4. **Email Preferences**: Let users choose OTP vs magic link
5. **2FA Option**: Add optional two-factor authentication
