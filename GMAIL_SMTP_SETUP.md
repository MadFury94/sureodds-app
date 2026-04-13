# Gmail SMTP Setup for OTP Emails

This guide shows you how to use Gmail to send OTP emails (completely FREE).

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Under "How you sign in to Google", click "2-Step Verification"
4. Follow the prompts to enable 2FA (you'll need your phone)

## Step 2: Generate App Password

1. Go back to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", click "App passwords"
   - If you don't see this option, make sure 2FA is enabled
3. In the "Select app" dropdown, choose "Mail"
4. In the "Select device" dropdown, choose "Other (Custom name)"
5. Type "Sureodds App" and click "Generate"
6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

## Step 3: Add to Environment Variables

### Local Development (.env.local)

```bash
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
FROM_EMAIL=your-email@gmail.com
```

### Vercel (Production)

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add these variables:

```
GMAIL_USER = your-email@gmail.com
GMAIL_APP_PASSWORD = abcdefghijklmnop
FROM_EMAIL = your-email@gmail.com
```

4. Redeploy your app

## Step 4: Test

1. Try to login/register
2. You should receive OTP email within seconds
3. Check spam folder if not in inbox

## Limits

- **500 emails per day** (Gmail free tier)
- Perfect for OTP emails
- Emails will show "via gmail.com"

## Troubleshooting

### "Invalid login" error
- Make sure you're using the App Password, NOT your regular Gmail password
- Remove any spaces from the app password

### "Less secure app" error
- You need to use App Password (see Step 2)
- Regular password won't work

### Emails going to spam
- This is normal for new senders
- Users should check spam folder
- Add "Sureodds" to their contacts

## Alternative: Custom SMTP

If you have your own email server or want to use another provider:

```bash
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@yourdomain.com
```

## Switching Back to Resend

If you want to use Resend later, just change the import in:
`src/app/api/auth/send-otp/route.ts`

From:
```typescript
import { sendOTPEmail } from "@/lib/email-nodemailer";
```

To:
```typescript
import { sendOTPEmail } from "@/lib/email";
```

## Support

- Gmail Help: [support.google.com/mail](https://support.google.com/mail)
- App Passwords: [support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833)
