# Magic Link & OTP Issues - Debug & Fix

## Issues Identified

### 1. Magic Link Not Being Sent
**Problem**: After admin approval, users don't receive magic link emails.

**Root Cause**: 
- `ADMIN_EMAIL` was set to `admin@sureodds.ng` (non-existent email)
- Admin notification emails were bouncing
- This was causing the email system to fail silently

**Fix Applied**:
- Changed `ADMIN_EMAIL` to `thecybertechhq@gmail.com` (your actual Gmail)
- Removed duplicate `FROM_EMAIL` entries in `.env.local`
- Added try-catch with detailed logging to approval email sending
- Approval process now continues even if email fails (user is still approved)

### 2. OTP Code Mismatch
**Problem**: Code stored in WordPress differs from code sent via email.

**Possible Causes**:
- Multiple OTP requests generating different codes
- WordPress transient API not saving properly
- Race condition in WordPress API
- User checking old email instead of latest one

**Fix Applied**:
- Added detailed timestamps to OTP storage logs
- Added "BEFORE STORAGE" and "STORED SUCCESSFULLY" logs
- Added "EMAIL SEND" logs with timestamps
- This will help identify if codes are being regenerated

## Environment Variables Fixed

### Before:
```env
RESEND_API_KEY=re_31rGk1ZZ_6sEqTsiCYchtto4sQZnj9a4q
FROM_EMAIL=noreply@sureodds.ng
ADMIN_EMAIL=admin@sureodds.ng

GMAIL_USER=thecybertechhq@gmail.com
GMAIL_APP_PASSWORD=iajv wphc wftk zgzw
FROM_EMAIL=thecybertechhq@gmail.com  # DUPLICATE!
```

### After:
```env
RESEND_API_KEY=re_31rGk1ZZ_6sEqTsiCYchtto4sQZnj9a4q

# Gmail SMTP Configuration (Primary email service)
GMAIL_USER=thecybertechhq@gmail.com
GMAIL_APP_PASSWORD=iajv wphc wftk zgzw

# Email addresses
FROM_EMAIL=thecybertechhq@gmail.com
ADMIN_EMAIL=thecybertechhq@gmail.com  # FIXED: Now uses real Gmail
```

## What to Check in Vercel

### 1. Update Vercel Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Update these:
- `ADMIN_EMAIL` = `thecybertechhq@gmail.com`
- `FROM_EMAIL` = `thecybertechhq@gmail.com`

Make sure these are also set:
- `GMAIL_USER` = `thecybertechhq@gmail.com`
- `GMAIL_APP_PASSWORD` = `iajv wphc wftk zgzw`
- `NEXT_PUBLIC_APP_URL` = `https://sureodds.ng` (or your Vercel URL)

### 2. Redeploy After Env Variable Changes
After updating environment variables, trigger a new deployment or restart the project.

### 3. Check Logs for Magic Link
When you click "Approve" on a user, look for these logs:
```
🔗 [approve] Generated magic token for: user@example.com
📧 [approve] Sending approval email with magic link...
✅ [approve] Approval email sent successfully to: user@example.com
```

If you see:
```
❌ [approve] Failed to send approval email: [error details]
```
Then check the error message for clues.

### 4. Check Logs for OTP Code
When requesting OTP, look for:
```
💾 [storeOTP] BEFORE STORAGE: { email, code, key, timestamp }
✅ [storeOTP] STORED SUCCESSFULLY: { email, code, key, timestamp }
📧 [sendOTPEmail] ===== STARTING EMAIL SEND =====
📧 [sendOTPEmail] Code: 123456
✅ [sendOTPEmail] ===== EMAIL SENT SUCCESSFULLY =====
✅ [sendOTPEmail] Code sent: 123456
```

Compare the timestamps and codes to see if they match.

## Testing Steps

### Test Magic Link:
1. Register a new punter account
2. Go to Admin Dashboard → Users
3. Click "Approve" on the pending user
4. Check Vercel logs for approval email logs
5. Check user's email inbox for magic link
6. Click magic link - should auto-login to dashboard

### Test OTP:
1. Go to login page
2. Enter email and request OTP
3. Check Vercel logs for OTP storage and email logs
4. Note the code in logs and compare with email
5. Enter the code from email
6. Should login successfully

## Common Issues

### Issue: "Token found: No"
This means the magic link token is not being generated or passed correctly.
- Check if `createMagicLink()` is being called
- Check if token is in the email URL
- Check Vercel logs for "Generated magic token"

### Issue: OTP codes don't match
- User might be using an old OTP from a previous request
- Check timestamps in logs to confirm
- OTP expires after 5 minutes
- Each new request generates a new code

### Issue: Emails not being sent
- Check Gmail credentials in Vercel env variables
- Check if Gmail app password has spaces (should be removed)
- Check Vercel logs for SMTP errors
- Verify Gmail account allows "Less secure app access" or uses App Password

## Files Modified

1. `.env.local` - Fixed ADMIN_EMAIL and removed duplicate FROM_EMAIL
2. `src/app/api/admin/users/[id]/route.ts` - Added try-catch and logging for approval emails
3. `src/lib/otp.ts` - Added detailed logging with timestamps
4. `src/lib/email-nodemailer.ts` - Added detailed logging for OTP emails

## Next Steps

1. Update Vercel environment variables
2. Redeploy or restart Vercel project
3. Test user approval flow
4. Check Vercel logs for detailed output
5. Report back with any error messages from logs
