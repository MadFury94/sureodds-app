# Magic Link Not Being Sent - Debug Guide

## The Real Issue

Based on Vercel logs showing "Token found: No", the magic link email is NOT being sent at all. The approval process completes, but the email never reaches the user.

## What "Token found: No" Means

This error appears when someone tries to access `/api/auth/magic` without a token parameter. This happens when:
1. User clicks a magic link that doesn't have the token in the URL
2. User manually visits the magic link endpoint
3. **Most likely: The email was never sent, so there's no link to click**

## Debugging Steps

### 1. Check Vercel Logs When Clicking "Approve"

After clicking "Approve" on a user, you should see these logs in order:

```
🔗 [approve] Generated magic token for: user@example.com
📧 [approve] Sending approval email with magic link...
📧 [sendApprovalEmail] ===== STARTING MAGIC LINK EMAIL =====
📧 [sendApprovalEmail] To: user@example.com
📧 [sendApprovalEmail] Magic Token: eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoicHVudGVyIiwiZXhwaXJlc0F0IjoxNzEzNDU2Nzg5MDAwLCJub25jZSI6ImFiYzEyMyJ9
📧 [sendApprovalEmail] Dashboard URL: https://sureodds.ng/auth/magic?token=...
📧 [sendApprovalEmail] SITE: https://sureodds.ng
📧 [sendApprovalEmail] FROM: thecybertechhq@gmail.com
✅ [sendApprovalEmail] ===== EMAIL SENT SUCCESSFULLY =====
✅ [sendApprovalEmail] Message ID: <some-id@gmail.com>
✅ [approve] Approval email sent successfully to: user@example.com
```

### 2. If You DON'T See These Logs

The email function is not being called. Possible reasons:
- The approval endpoint is failing before reaching the email code
- There's an error in the `updateUser` function
- The try-catch is swallowing errors silently

### 3. If You See Error Logs

Look for:
```
❌ [approve] Failed to send approval email: [error message]
❌ [sendApprovalEmail] ===== EMAIL SEND FAILED =====
```

Common errors:
- **SMTP Authentication Failed**: Gmail credentials are wrong
- **Invalid FROM address**: FROM_EMAIL not set correctly
- **Connection timeout**: Network issues or Gmail blocking
- **Missing NEXT_PUBLIC_APP_URL**: SITE variable is undefined

## Environment Variables to Check in Vercel

Go to: Vercel Dashboard → Project → Settings → Environment Variables

### Required Variables:
```
GMAIL_USER=thecybertechhq@gmail.com
GMAIL_APP_PASSWORD=iajv wphc wftk zgzw
FROM_EMAIL=thecybertechhq@gmail.com
NEXT_PUBLIC_APP_URL=https://sureodds.ng
```

### Important Notes:
- `NEXT_PUBLIC_APP_URL` must NOT have trailing slash
- `GMAIL_APP_PASSWORD` should have spaces removed (code does this automatically)
- After changing env variables, you MUST redeploy or restart

## Testing the Email Function Directly

Create a test endpoint to verify email sending works:

```typescript
// src/app/api/test-magic-link/route.ts
import { NextResponse } from "next/server";
import { sendApprovalEmailWithMagicLink } from "@/lib/email-nodemailer";
import { createMagicLink } from "@/lib/magic-link";

export async function GET() {
    try {
        const testEmail = "your-test-email@gmail.com";
        const magicToken = createMagicLink(testEmail, "punter");
        
        await sendApprovalEmailWithMagicLink(
            testEmail,
            "Test User",
            "punter",
            magicToken
        );
        
        return NextResponse.json({ success: true, message: "Test email sent!" });
    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}
```

Visit: `https://your-vercel-url.vercel.app/api/test-magic-link`

## OTP Code Mismatch Issue

The OTP codes not matching is likely because:
1. User requests OTP multiple times (each generates a new code)
2. User is checking an old email instead of the latest one
3. WordPress transient is being overwritten by multiple requests

### Solution:
The detailed logging now shows timestamps. Compare:
- Time OTP was stored
- Time email was sent
- Time user entered the code

If timestamps show multiple OTP requests, that's the issue.

## Next Steps

1. Deploy the updated code with detailed logging
2. Try approving a test user
3. Check Vercel logs immediately after clicking "Approve"
4. Share the logs here - specifically look for:
   - "Generated magic token"
   - "Sending approval email"
   - "EMAIL SENT SUCCESSFULLY" or "EMAIL SEND FAILED"
5. If no email logs appear, the function isn't being called
