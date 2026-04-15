# Dynamic URL Detection for Magic Links - Implementation Summary

## Problem
Magic links in emails were always using `https://sureodds.ng` regardless of the environment (localhost, Vercel preview, or custom domain). This happened because the code used a hardcoded fallback when `NEXT_PUBLIC_APP_URL` wasn't set.

## Solution
Implemented dynamic URL detection that automatically uses the correct domain based on the environment:

### Priority Order:
1. **NEXT_PUBLIC_APP_URL** (if explicitly set) - Highest priority
2. **VERCEL_URL** (automatically set by Vercel) - Used for Vercel deployments
3. **Fallback** to `https://sureodds.ng` - Production domain

## Changes Made

### 1. Created `getSiteUrl()` Helper Function
```typescript
export function getSiteUrl(): string {
    // Priority 1: Environment variable (if explicitly set)
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    
    // Priority 2: Vercel URL (automatically set by Vercel)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    
    // Priority 3: Fallback to production domain
    return "https://sureodds.ng";
}
```

### 2. Updated All Email Functions
Modified these functions to use `getSiteUrl()` instead of the static `SITE` constant:
- `sendApprovalEmailWithMagicLink()` - Magic link emails
- `sendSuspensionEmail()` - Suspension notifications
- `sendWelcomeEmail()` - Welcome emails for subscribers
- `sendNewUserNotificationToAdmin()` - Admin notifications
- `base()` - Email template (for logo and footer links)

### 3. Enhanced Logging
Added detailed logging to show which URL is being used:
```
📧 [email-nodemailer] Configuration loaded:
📧 [email-nodemailer] NEXT_PUBLIC_APP_URL: http://localhost:3000
📧 [email-nodemailer] VERCEL_URL: not set
📧 [email-nodemailer] Resolved SITE: http://localhost:3000
```

## How It Works in Different Environments

### Local Development (localhost:3000)
- `.env.local` has: `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- Magic links will use: `http://localhost:3000/auth/magic?token=...`

### Vercel Deployment (without custom domain)
- Vercel automatically sets: `VERCEL_URL=your-app-abc123.vercel.app`
- Magic links will use: `https://your-app-abc123.vercel.app/auth/magic?token=...`

### Vercel Preview Deployments
- Each preview gets unique URL: `VERCEL_URL=your-app-git-branch-abc123.vercel.app`
- Magic links automatically use the preview URL

### Production with Custom Domain
- Set in Vercel: `NEXT_PUBLIC_APP_URL=https://sureodds.ng`
- Magic links will use: `https://sureodds.ng/auth/magic?token=...`

## Benefits

1. **No Configuration Needed**: Works automatically on Vercel without setting `NEXT_PUBLIC_APP_URL`
2. **Preview Deployments Work**: Each Vercel preview branch gets correct URLs
3. **Local Development Works**: Uses localhost automatically
4. **Flexible**: Can still override with `NEXT_PUBLIC_APP_URL` if needed
5. **Safe Fallback**: Always falls back to production domain if nothing is set

## Testing

### Test Locally:
1. Run `npm run dev`
2. Register a punter account
3. Approve from admin dashboard
4. Magic link should use `http://localhost:3000`

### Test on Vercel:
1. Deploy to Vercel
2. Check logs for "Resolved SITE" - should show Vercel URL
3. Approve a user
4. Magic link should use your Vercel URL

### Test with Custom Domain:
1. Set `NEXT_PUBLIC_APP_URL` in Vercel to your custom domain
2. Redeploy
3. Magic links should use custom domain

## Files Modified

- `src/lib/email-nodemailer.ts` - Added `getSiteUrl()` and updated all email functions

## No Breaking Changes

This is a backward-compatible change:
- If `NEXT_PUBLIC_APP_URL` is set, it works exactly as before
- If not set, it now intelligently detects the correct URL
- Existing deployments continue to work without changes
