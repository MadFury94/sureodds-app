# Email Not Sending - Troubleshooting Guide

## Changes Made

### 1. Updated Email Library (`src/lib/email-nodemailer.ts`)
- ✅ Added automatic removal of spaces from Gmail App Password
- ✅ Added detailed logging for debugging
- ✅ Better error messages

### 2. Updated Test Email Endpoint (`src/app/api/test-email/route.ts`)
- ✅ Now uses Nodemailer/Gmail instead of Resend
- ✅ Can test email sending directly

### 3. Enhanced Logging in Send-OTP Route
- ✅ More detailed console logs to track email sending

## How to Test Email Sending

### Method 1: Test Email Endpoint
Visit this URL in your browser (while dev server is running):
```
http://localhost:3000/api/test-email
```

This will:
- Check if Gmail credentials are configured
- Send a test OTP email to your Gmail account
- Show detailed error messages if something fails

### Method 2: Check Server Console
When you try to register/login, check your terminal/console for these logs:

**Success logs:**
```
📧 [sendOTPEmail] Starting email send...
📧 [sendOTPEmail] To: user@example.com
📧 [sendOTPEmail] Code: 123456
📧 Creating Gmail transporter...
📧 [sendOTPEmail] Transporter created successfully
📧 [sendOTPEmail] Sending email...
✅ [sendOTPEmail] Email sent successfully!
✅ [sendOTPEmail] Message ID: <...>
```

**Error logs:**
```
❌ [sendOTPEmail] Failed to send email
❌ [sendOTPEmail] Error message: [error details]
```

## Common Issues & Solutions

### Issue 1: Gmail App Password Has Spaces
**Solution:** ✅ FIXED - The code now automatically removes spaces from the password

### Issue 2: Gmail "Less Secure Apps" Blocked
**Solution:** 
- You MUST use an App Password, not your regular Gmail password
- Go to: https://myaccount.google.com/apppasswords
- Generate a new App Password
- Copy it to `.env.local` as `GMAIL_APP_PASSWORD`

### Issue 3: 2-Factor Authentication Not Enabled
**Solution:**
- Gmail App Passwords require 2FA to be enabled
- Enable 2FA: https://myaccount.google.com/security
- Then create App Password

### Issue 4: Wrong Gmail Account
**Solution:**
- Make sure `GMAIL_USER` matches the account you created the App Password for
- Both must be the same Gmail account

### Issue 5: Environment Variables Not Loaded
**Solution:**
1. Restart your dev server completely
2. Run: `npm run dev`
3. Check console for "📧 Gmail User: ✓ Set" message

## Current Configuration

Check your `.env.local` file has these variables:
```env
GMAIL_USER=thecybertechhq@gmail.com
GMAIL_APP_PASSWORD=iajv wphc wftk zgzw
FROM_EMAIL=thecybertechhq@gmail.com
```

## Testing Steps

1. **Stop your dev server** (Ctrl+C)

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test email endpoint:**
   - Open browser: `http://localhost:3000/api/test-email`
   - Should see: `{"success":true,"message":"Test email sent successfully..."}`
   - Check your Gmail inbox (thecybertechhq@gmail.com)

4. **If test email works:**
   - Try registering a new user
   - Check server console for logs
   - Check email inbox

5. **If test email fails:**
   - Check the error message in browser
   - Check server console for detailed error
   - Verify Gmail App Password is correct
   - Verify 2FA is enabled on Gmail account

## Gmail App Password Setup (If Needed)

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to: thecybertechhq@gmail.com
3. Click "Generate" or "Create"
4. Select "Mail" and "Other (Custom name)"
5. Name it: "Sureodds App"
6. Click "Generate"
7. Copy the 16-character password (it will have spaces)
8. Paste it in `.env.local` as `GMAIL_APP_PASSWORD`
9. Restart dev server

## Check Email Logs

When you try to send OTP, watch your terminal for:
```
📧 Attempting to send OTP email...
📧 To: user@example.com
📧 Code: 123456
📧 Gmail User: ✓ Set
📧 Gmail Password: ✓ Set
📧 [sendOTPEmail] Starting email send...
📧 Creating Gmail transporter...
📧 Gmail User: thecybertechhq@gmail.com
📧 Password length: 16
📧 [sendOTPEmail] Transporter created successfully
📧 [sendOTPEmail] Sending email...
✅ [sendOTPEmail] Email sent successfully!
```

## Still Not Working?

If emails still don't send after trying all above:

1. **Check Gmail Security:**
   - Go to: https://myaccount.google.com/notifications
   - Look for any blocked sign-in attempts
   - Allow the app if blocked

2. **Try Different Email:**
   - Test with a different Gmail account
   - Some Gmail accounts have stricter security

3. **Check Spam Folder:**
   - Emails might be going to spam
   - Check spam/junk folder in recipient's email

4. **Verify Network:**
   - Make sure your internet connection is stable
   - Gmail SMTP requires port 587 or 465 to be open

5. **Alternative: Use SMTP Directly:**
   Instead of `service: "gmail"`, use explicit SMTP:
   ```typescript
   host: "smtp.gmail.com",
   port: 587,
   secure: false,
   auth: { user: "...", pass: "..." }
   ```

## Next Steps

1. Visit `/api/test-email` to test email sending
2. Check server console for detailed logs
3. If test succeeds, try registering a user
4. Share any error messages you see
