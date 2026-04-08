# Vercel Deployment Guide

## Environment Variables Setup

Your app requires several API keys to function properly. These need to be added to Vercel's environment variables.

### Required Environment Variables

1. **RAPIDAPI_KEY** - For Head-to-Head match data
   - Get from: https://rapidapi.com/
   - Subscribe to SportAPI7

2. **RAPIDAPI_HOST** - SportAPI host
   - Value: `sportapi7.p.rapidapi.com`

3. **FOOTBALL_DATA_API_KEY** - For league data, standings, fixtures, top scorers
   - Get from: https://www.football-data.org/
   - Free tier: 10 requests/minute

4. **NEXT_PUBLIC_WP_API_URL** - WordPress API endpoint
   - Value: `https://sureodds.ng/wp-json/wp/v2`

5. **NEXT_PUBLIC_SITE_URL** - Your site URL
   - Value: `https://sureodds.ng` or your custom domain

---

## How to Add Environment Variables to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project (`sureodds-app`)
3. Click **Settings** in the top navigation
4. Click **Environment Variables** in the left sidebar
5. For each variable:
   - Enter the **Key** (e.g., `FOOTBALL_DATA_API_KEY`)
   - Enter the **Value** (your actual API key)
   - Select environments: **Production**, **Preview**, **Development** (check all three)
   - Click **Save**

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add FOOTBALL_DATA_API_KEY
# Enter the value when prompted
# Select: Production, Preview, Development

# Repeat for each variable
vercel env add RAPIDAPI_KEY
vercel env add RAPIDAPI_HOST
vercel env add NEXT_PUBLIC_WP_API_URL
vercel env add NEXT_PUBLIC_SITE_URL
```

---

## After Adding Environment Variables

### Option 1: Redeploy from Dashboard
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (...) menu
4. Click **Redeploy**
5. Check "Use existing Build Cache" (optional)
6. Click **Redeploy**

### Option 2: Push a New Commit
```bash
git add .
git commit -m "Update environment variables"
git push
```

This will trigger a new deployment automatically.

---

## Verify Deployment

After redeployment, check these pages to verify APIs are working:

1. **Homepage** - Should show live matches ticker (if any matches are live)
2. **League Pages** - `/category/epl`, `/category/la-liga`
   - Check if standings table loads
   - Check if fixtures load
   - Check if top scorers load
3. **Match Details** - Click any match card
   - Should show lineups, goals, cards
4. **Team Pages** - Click a team crest
   - Should show squad list

---

## Troubleshooting

### APIs Not Working After Deployment

**Check 1: Environment Variables**
- Go to Vercel Dashboard → Settings → Environment Variables
- Verify all variables are set for Production environment
- Make sure there are no typos in variable names

**Check 2: API Key Validity**
- Test your Football-Data.org key: https://www.football-data.org/
- Test your RapidAPI key: https://rapidapi.com/

**Check 3: Deployment Logs**
- Go to Deployments tab
- Click on the latest deployment
- Check the **Build Logs** for errors
- Check the **Function Logs** for runtime errors

**Check 4: API Rate Limits**
- Football-Data.org free tier: 10 requests/minute
- If you exceed this, you'll get 429 errors
- Wait a minute and try again

### Common Errors

**Error: "Football-Data API key missing"**
- Solution: Add `FOOTBALL_DATA_API_KEY` to Vercel environment variables

**Error: "Cannot read properties of undefined"**
- Solution: API might be rate-limited or returning empty data
- Check API response in browser console

**Error: 429 Too Many Requests**
- Solution: You've exceeded the free tier limit
- Wait 1 minute before trying again
- Consider upgrading to paid tier if needed

---

## Environment Variable Naming

⚠️ **Important:** 
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-side only (more secure for API keys)
- Our API keys (FOOTBALL_DATA_API_KEY, RAPIDAPI_KEY) are server-side only for security

---

## Production Checklist

Before going live, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Environment variables are set for Production environment
- [ ] Latest code is deployed
- [ ] Homepage loads correctly
- [ ] League pages show standings and fixtures
- [ ] Match detail pages work
- [ ] Team pages load squad lists
- [ ] No console errors in browser
- [ ] API rate limits are acceptable for your traffic

---

## Monitoring

### Check API Usage

**Football-Data.org:**
- Login to https://www.football-data.org/
- Go to your account dashboard
- Check "API Calls" to see usage

**RapidAPI:**
- Login to https://rapidapi.com/
- Go to "My Apps"
- Check usage statistics

### Set Up Alerts

Consider setting up monitoring for:
- API rate limit warnings
- Failed API requests
- Page load errors

---

## Need Help?

If you're still having issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify API keys are valid
4. Test API endpoints directly using the test scripts:
   ```bash
   node test-football-data.mjs
   node test-new-features.mjs
   ```
