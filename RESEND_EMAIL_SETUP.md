# Resend Email Setup Guide

This guide will help you configure Resend for sending emails from your Sureodds application.

## Quick Start (Testing)

For immediate testing without domain verification:

1. **Get API Key**
   - Go to [resend.com/api-keys](https://resend.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `re_`)

2. **Set Environment Variables**
   
   In Vercel:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   FROM_EMAIL=onboarding@resend.dev
   ADMIN_EMAIL=your-admin@email.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   In `.env.local` (for local development):
   ```
   RESEND_API_KEY=re_your_actual_key_here
   FROM_EMAIL=onboarding@resend.dev
   ADMIN_EMAIL=your-admin@email.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Deploy and Test**
   - Deploy to Vercel
   - Try the OTP login feature
   - Emails will come from `onboarding@resend.dev`

## Production Setup (Custom Domain)

For professional branded emails from `noreply@sureodds.ng`:

### Step 1: Add Domain in Resend

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter `sureodds.ng`
4. Resend will provide DNS records

### Step 2: Add DNS Records

You'll receive 3 types of DNS records to add to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

#### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

#### DKIM Record
```
Type: TXT
Name: resend._domainkey
Value: [long string provided by Resend]
```

#### DMARC Record (Optional but recommended)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@sureodds.ng
```

### Step 3: Wait for Verification

- DNS propagation can take 24-48 hours (usually faster)
- Check verification status in Resend dashboard
- You'll see a green checkmark when verified

### Step 4: Update Environment Variables

Once domain is verified, update:

```
FROM_EMAIL=noreply@sureodds.ng
```

## Testing Email Delivery

Resend provides test email addresses that simulate different scenarios:

- `delivered@resend.dev` - Successfully delivered
- `bounced@resend.dev` - Simulates bounce
- `complained@resend.dev` - Simulates spam complaint
- `suppressed@resend.dev` - Simulates suppressed email

## Development Mode Features

In development (`NODE_ENV=development`), the OTP code is:
- Shown in browser alert popup
- Logged to browser console
- Logged to server terminal
- Sent via email (if configured)

This allows testing even if email delivery isn't working yet.

## Troubleshooting

### Emails Not Arriving

1. **Check API Key**
   - Verify `RESEND_API_KEY` is set correctly in Vercel
   - Check it starts with `re_`
   - Ensure no extra spaces

2. **Check From Address**
   - Use `onboarding@resend.dev` for testing
   - Custom domain must be verified before use

3. **Check Spam Folder**
   - Emails might be filtered as spam
   - Add sender to contacts

4. **Check Resend Dashboard**
   - Go to [resend.com/emails](https://resend.com/emails)
   - View sent emails and delivery status
   - Check for error messages

5. **Check Server Logs**
   - Look for `✅ OTP email sent:` or `❌ Resend API error:`
   - Errors will show specific issues

### Rate Limits

- Default: 5 requests per second
- Free tier: 100 emails per day
- If exceeded, you'll get `429` error
- Contact Resend support for increase

## Email Types in Sureodds

1. **OTP Codes** - Login and registration verification
2. **Welcome Emails** - New subscriber onboarding
3. **Admin Notifications** - New user registrations
4. **Payment Notifications** - Payment submissions
5. **Approval Emails** - Account activation
6. **Suspension Emails** - Account suspension notices

## Best Practices

1. **Always use environment variables** for API keys
2. **Verify your domain** for production
3. **Monitor email logs** in Resend dashboard
4. **Test with Resend test addresses** before production
5. **Add idempotency keys** for critical emails (optional)
6. **Set up webhooks** for delivery tracking (optional)

## Support

- Resend Documentation: [resend.com/docs](https://resend.com/docs)
- Resend Support: [resend.com/contact](https://resend.com/contact)
- Check server logs for detailed error messages

## Current Configuration

Your app is configured to use:
- **Test Mode**: `onboarding@resend.dev` (works immediately)
- **Production Mode**: `noreply@sureodds.ng` (requires domain verification)

The system automatically falls back to test mode if `FROM_EMAIL` is not set.
