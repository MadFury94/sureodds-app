# OTP Verification Error - Debugging Guide

## Error Message
"No OTP found. Please request a new one."

## What This Means
The OTP code you entered cannot be found in the system. This happens when:
1. The OTP was never stored (email sending failed)
2. The OTP expired (5-minute timeout)
3. The OTP was already used
4. Email address mismatch (typo or case sensitivity)
5. Server restarted and OTP file wasn't loaded

## Changes Made

### Enhanced Logging
**File:** `src/lib/otp.ts`

Added detailed console logs to help debug:

**When OTP is stored:**
```
💾 [storeOTP] Stored OTP:
  Email (original): user@example.com
  Email (normalized): user@example.com
  Code: 123456
  Purpose: register
  Expires at: 2024-01-01T12:05:00.000Z
  Total OTPs in store: 1
```

**When OTP is verified:**
```
🔍 OTP Verification Debug:
  Email (original): user@example.com
  Email (normalized): user@example.com
  Code entered: 123456
  Entry found: Yes
  Total OTPs in store: 1
  All stored emails: ["user@example.com"]
  Stored code: 123456
  Code match: true
  Expired: false
  Attempts: 0
  Purpose: register
✅ OTP verified successfully for: user@example.com
```

**When OTP is not found:**
```
🔍 OTP Verification Debug:
  Email (original): user@example.com
  Email (normalized): user@example.com
  Code entered: 123456
  Entry found: No
  Total OTPs in store: 0
  All stored emails: []
❌ No OTP entry found for: user@example.com
```

### Email Normalization
- Added `.trim()` to remove whitespace
- Both storage and verification now use the same normalization

### File Persistence Logging
```
📂 [loadOTPsFromFile] Loading OTPs from: /path/to/.otp-store.json
📂 [loadOTPsFromFile] Found 1 entries in file
📂 [loadOTPsFromFile] Loaded OTP for: user@example.com
✅ [loadOTPsFromFile] Loaded 1 valid OTPs from file
```

## How to Debug

### Step 1: Check Server Console When Sending OTP
When you click "Send Code", look for these logs:

```
📧 Attempting to send OTP email...
📧 To: user@example.com
📧 Code: 746580
💾 [storeOTP] Stored OTP:
  Email (normalized): user@example.com
  Code: 746580
  Total OTPs in store: 1
```

**If you see this:** OTP was stored successfully ✅

**If you don't see this:** OTP was not stored ❌
- Check if send-otp API is being called
- Check for errors in the API route

### Step 2: Check Server Console When Verifying OTP
When you click "Verify & Create Account", look for these logs:

```
🔍 OTP Verification Debug:
  Email (normalized): user@example.com
  Code entered: 746580
  Entry found: Yes
  Total OTPs in store: 1
  All stored emails: ["user@example.com"]
  Stored code: 746580
  Code match: true
✅ OTP verified successfully
```

**If "Entry found: No":**
- Check "All stored emails" - is your email in the list?
- Check if email addresses match exactly
- Check "Total OTPs in store" - should be > 0

**If "Code match: false":**
- Check "Stored code" vs "Code entered"
- Make sure you're entering the correct code
- Check if code has spaces or extra characters

**If "Expired: true":**
- OTP expired (5 minutes)
- Request a new code

### Step 3: Check OTP Store File
The OTP codes are stored in `.otp-store.json` in your project root.

**View the file:**
```bash
cat .otp-store.json
```

**Example content:**
```json
[
  [
    "user@example.com",
    {
      "code": "746580",
      "email": "user@example.com",
      "purpose": "register",
      "userData": {
        "name": "John Doe",
        "userType": "punter"
      },
      "expiresAt": 1704110700000,
      "attempts": 0
    }
  ]
]
```

**Check:**
- Is your email in the file?
- Is the code correct?
- Is `expiresAt` in the future? (timestamp in milliseconds)

### Step 4: Common Issues

#### Issue 1: Server Restarted
**Symptom:** OTP was sent but after server restart, verification fails

**Solution:** 
- The OTP file should be loaded automatically on startup
- Check server console for: `✅ [loadOTPsFromFile] Loaded X valid OTPs from file`
- If not loaded, restart dev server: `npm run dev`

#### Issue 2: Email Mismatch
**Symptom:** "All stored emails" shows different email than what you entered

**Solution:**
- Check for typos in email address
- Make sure you're using the same email for both send and verify
- Check for extra spaces or special characters

#### Issue 3: OTP Expired
**Symptom:** "Expired: true" in logs

**Solution:**
- OTP expires after 5 minutes
- Click "Resend Code" to get a new one
- Complete verification within 5 minutes

#### Issue 4: OTP Already Used
**Symptom:** OTP not found after successful verification

**Solution:**
- OTPs are single-use only
- After successful verification, OTP is deleted
- If you need to verify again, request a new code

#### Issue 5: Multiple Requests
**Symptom:** Getting different codes each time

**Solution:**
- Each "Send Code" request generates a NEW code
- The old code is replaced
- Always use the MOST RECENT code you received

## Testing Steps

### Test 1: Fresh Registration
1. Stop dev server (Ctrl+C)
2. Delete `.otp-store.json` file
3. Start dev server: `npm run dev`
4. Go to `/register`
5. Fill in details and click "Send Code"
6. Watch server console for storage logs
7. Enter the code shown in console
8. Watch server console for verification logs

### Test 2: Server Restart
1. Complete Test 1 but DON'T verify yet
2. Stop dev server (Ctrl+C)
3. Start dev server: `npm run dev`
4. Watch for: `✅ [loadOTPsFromFile] Loaded X valid OTPs`
5. Try to verify with the code
6. Should work if OTP hasn't expired

### Test 3: Email Mismatch
1. Send OTP to: `test@example.com`
2. Try to verify with: `Test@Example.com` (different case)
3. Should still work (case-insensitive)
4. Check logs show same normalized email

## Quick Fix

If OTP verification keeps failing:

1. **Clear OTP store:**
   ```bash
   rm .otp-store.json
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Try registration again:**
   - Go to `/register`
   - Enter details
   - Click "Send Code"
   - Check server console for storage logs
   - Enter code immediately (don't wait)
   - Check server console for verification logs

4. **Share logs:**
   - Copy the console logs from both storage and verification
   - Share them so we can see what's happening

## What to Share

If the issue persists, share these from your server console:

1. **Storage logs** (when you click "Send Code"):
   ```
   💾 [storeOTP] Stored OTP:
   ...
   ```

2. **Verification logs** (when you click "Verify"):
   ```
   🔍 OTP Verification Debug:
   ...
   ```

3. **File content** (if exists):
   ```bash
   cat .otp-store.json
   ```

This will help identify exactly where the issue is occurring.
