# OTP "Not Found" Error - Fix Summary

## Problem
Users were getting "No OTP found. Please request a new one." error when trying to verify their OTP code during registration/login.

## Root Cause
The OTP system stores codes in memory (RAM). In development mode, Next.js frequently restarts the server (hot reload), which clears the memory and loses all stored OTPs.

**Timeline:**
1. User requests OTP → Server generates code "123456" → Stored in memory
2. Server restarts (hot reload) → Memory cleared → OTP lost
3. User enters code "123456" → Server checks memory → Not found → Error

## Solutions Implemented

### 1. File-Based Persistence (Development Only)
**File**: `src/lib/otp.ts`

Added automatic file storage for development:
- OTPs are saved to `.otp-store.json` file
- File is loaded on server startup
- Survives server restarts
- Only active in development mode
- File is gitignored for security

### 2. Better OTP Display
**Files**: `src/app/register/page.tsx`, `src/app/login/page.tsx`

Improved how OTP is shown in development:
- ✅ Alert popup with code
- ✅ Console log with code
- ✅ Green success message shows: "✅ OTP sent! Your code is: 123456"
- No more confusion about which code to use

### 3. Enhanced Debugging
**File**: `src/lib/otp.ts`

Added detailed console logs:
```
🔍 OTP Verification Debug:
  Email: user@example.com
  Code entered: 123456
  Entry found: Yes
  Stored code: 123456
  Expired: false
  Attempts: 0
  Total OTPs in store: 1
```

## How to Test

### Step 1: Restart Development Server
```bash
npm run dev
```

### Step 2: Register New User
1. Go to http://localhost:3000/register
2. Fill in name and email
3. Select account type (Punter or Subscriber)
4. Click "Send Verification Code"

### Step 3: Get OTP Code
You'll see the code in THREE places:
1. **Alert popup** - Click OK to dismiss
2. **Green message** - "✅ OTP sent! Your code is: 123456"
3. **Browser console** - Press F12 → Console tab

### Step 4: Enter Code
1. Copy the 6-digit code
2. Paste into the input field
3. Click "Verify & Create Account"

### Step 5: Success!
- Punters → Redirected to `/register/pending`
- Subscribers → Redirected to `/subscribe` (payment page)

## Production Considerations

### Current Setup (Development)
- ✅ File-based storage
- ✅ Survives server restarts
- ✅ Easy debugging
- ❌ Not scalable
- ❌ Single server only

### Recommended for Production
Replace file storage with Redis:

```typescript
// Example Redis implementation
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function storeOTP(email: string, code: string, ...) {
    await redis.setex(
        `otp:${email}`,
        300, // 5 minutes
        JSON.stringify({ code, purpose, userData })
    );
}

export async function verifyOTP(email: string, code: string) {
    const data = await redis.get(`otp:${email}`);
    if (!data) return { valid: false, error: "No OTP found" };
    // ... rest of verification logic
}
```

### Why Redis?
- ✅ Persistent storage
- ✅ Automatic expiration
- ✅ Works across multiple servers
- ✅ Fast (in-memory)
- ✅ Production-ready

## Files Changed

1. `src/lib/otp.ts` - Added file persistence and debugging
2. `src/app/register/page.tsx` - Improved OTP display
3. `src/app/login/page.tsx` - Improved OTP display
4. `.gitignore` - Added `.otp-store.json`

## Testing Checklist

- [ ] OTP code appears in alert popup
- [ ] OTP code appears in green success message
- [ ] OTP code appears in browser console
- [ ] Can verify OTP successfully
- [ ] OTP survives server restart (in development)
- [ ] OTP expires after 5 minutes
- [ ] Can't use same OTP twice
- [ ] Max 3 attempts per OTP
- [ ] Rate limiting works (5 requests per 15 minutes)

## Common Issues

### Issue: Still getting "No OTP found"
**Solution**: 
1. Check browser console for the actual OTP code
2. Make sure you're using the code from the green message
3. Restart the dev server completely
4. Clear the `.otp-store.json` file if it exists

### Issue: OTP not showing in success message
**Solution**:
1. Check if `NODE_ENV=development` in your environment
2. Verify the API is returning `data.code` in response
3. Check browser console for any JavaScript errors

### Issue: Email not received
**Solution**:
1. Check Gmail SMTP credentials in `.env.local`
2. Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set
3. Check spam folder
4. Use the code from the screen/console instead

## Security Notes

1. **Development Mode Only**: OTP codes are only shown on screen in development
2. **Production**: Codes are only sent via email
3. **File Storage**: `.otp-store.json` is gitignored
4. **Expiration**: All OTPs expire after 5 minutes
5. **One-Time Use**: Each OTP can only be used once
6. **Rate Limiting**: Max 5 OTP requests per 15 minutes per IP

## Next Steps

After testing locally:
1. Deploy to Vercel
2. Set up Redis for production (optional but recommended)
3. Configure email service (Gmail SMTP or Resend)
4. Test OTP flow in production
5. Monitor for any issues
