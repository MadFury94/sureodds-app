# Email System Update - Magic Links via Nodemailer

## Problem
After admin approved a punter, they received an email with subject "Your Registration Code" containing an OTP code instead of a magic link to access the dashboard.

## Root Cause
The system had two email libraries:
1. `src/lib/email.ts` - Resend (original, not working)
2. `src/lib/email-nodemailer.ts` - Gmail SMTP (working for OTP)

The admin approval route was importing from the Resend library which:
- Wasn't configured properly
- Didn't have Gmail SMTP support
- Was sending OTP-style emails instead of magic links

## Solution
Migrated all email functions to use Nodemailer (Gmail SMTP):

### Files Updated

1. **src/lib/email-nodemailer.ts**
   - Added `sendApprovalEmailWithMagicLink()` - Sends magic link after approval
   - Added `sendSuspensionEmail()` - Sends suspension notification
   - Added `sendWelcomeEmail()` - Sends welcome email to subscribers
   - Added `sendNewUserNotificationToAdmin()` - Notifies admin of new registrations

2. **src/app/api/admin/users/[id]/route.ts**
   - Changed import from `@/lib/email` to `@/lib/email-nodemailer`
   - Now uses Gmail SMTP for all approval emails

3. **src/app/api/auth/verify-otp/route.ts**
   - Changed import from `@/lib/email` to `@/lib/email-nodemailer`
   - Now uses Gmail SMTP for welcome and admin notification emails

## Email Flow After Approval

### Punter Approval
```
Admin clicks "Approve" 
    ↓
System generates magic link token
    ↓
Email sent via Gmail SMTP:
    Subject: "✅ Punter Account Activated — Start Posting!"
    Content:
    - "You're in, [Name]!"
    - "Your punter account has been approved"
    - [Access Your Dashboard →] button (magic link)
    - "🔐 One-Time Access Link" notice
    - "For future logins, visit: /login"
    ↓
Punter clicks button
    ↓
Redirected to /auth/magic?token=xxxxx
    ↓
Auto-logged in and redirected to /dashboard/punter
```

### Subscriber Approval
```
Admin clicks "Approve" (after payment verification)
    ↓
System generates magic link token
System sets subscription expiry date
    ↓
Email sent via Gmail SMTP:
    Subject: "✅ Subscription Activated — Welcome to Sureodds!"
    Content:
    - "You're in, [Name]!"
    - "Your payment has been confirmed"
    - Status: Active ✓
    - Expires: [Date]
    - [Access Your Dashboard →] button (magic link)
    - "🔐 One-Time Access Link" notice
    - "For future logins, visit: /login"
    ↓
Subscriber clicks button
    ↓
Redirected to /auth/magic?token=xxxxx
    ↓
Auto-logged in and redirected to /dashboard
```

## Email Templates

### Approval Email Features
- ✅ Clean, branded design with logo
- ✅ Clear call-to-action button
- ✅ Magic link that expires in 24 hours
- ✅ One-time use only
- ✅ Instructions for future logins
- ✅ Role-specific messaging (punter vs subscriber)
- ✅ Subscription expiry date (subscribers only)

### Email Styling
- Professional HTML template
- Mobile-responsive
- Sureodds branding
- Clear visual hierarchy
- Accessible design

## Testing

### Test Punter Approval
1. Register as punter
2. Admin approves from dashboard
3. Check email inbox
4. Should receive: "✅ Punter Account Activated — Start Posting!"
5. Click "Access Your Dashboard →" button
6. Should auto-login to /dashboard/punter

### Test Subscriber Approval
1. Register as subscriber
2. Complete payment
3. Admin approves from dashboard
4. Check email inbox
5. Should receive: "✅ Subscription Activated — Welcome to Sureodds!"
6. Click "Access Your Dashboard →" button
7. Should auto-login to /dashboard

### Verify Email Content
- ✅ No OTP codes in approval emails
- ✅ Magic link button present
- ✅ Correct subject line
- ✅ Role-specific content
- ✅ Expiry date shown (subscribers only)

## Environment Variables Required

```env
# Gmail SMTP (for sending emails)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Site URL (for magic links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin email (for notifications)
ADMIN_EMAIL=admin@sureodds.ng

# From email (sender address)
FROM_EMAIL=noreply@sureodds.ng
```

## Benefits

1. **Better UX**: One-click access instead of copying OTP codes
2. **Consistent System**: All emails use Gmail SMTP
3. **Secure**: Magic links expire and can only be used once
4. **Professional**: Branded, well-designed emails
5. **Clear Instructions**: Users know what to do next

## Migration Notes

### Old System (Resend)
- ❌ Not configured
- ❌ Sending OTP codes for approval
- ❌ Confusing user experience
- ❌ Required API key setup

### New System (Nodemailer + Gmail)
- ✅ Working with Gmail SMTP
- ✅ Sending magic links for approval
- ✅ Clear user experience
- ✅ Uses existing Gmail credentials

## Future Improvements

1. **Email Templates**: Move HTML to separate template files
2. **Email Queue**: Add queue system for bulk emails
3. **Email Tracking**: Track open rates and click rates
4. **Resend Migration**: Optionally migrate to Resend if needed
5. **Email Preferences**: Let users choose email frequency

## Troubleshooting

### Issue: Still receiving OTP emails
**Solution**: 
1. Restart development server
2. Clear browser cache
3. Check imports in route files
4. Verify Gmail credentials in .env.local

### Issue: Magic link not working
**Solution**:
1. Check NEXT_PUBLIC_APP_URL is set correctly
2. Verify magic link token is generated
3. Check browser console for errors
4. Try clicking link in incognito mode

### Issue: Email not received
**Solution**:
1. Check Gmail credentials
2. Check spam folder
3. Verify GMAIL_APP_PASSWORD is correct
4. Check server logs for email errors
