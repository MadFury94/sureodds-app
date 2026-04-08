# Vercel Deployment Checklist

## Quick Fix for APIs Not Working

### Step 1: Add Environment Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: `sureodds-app`
3. Click: **Settings** → **Environment Variables**
4. Add these variables (one by one):

```
Variable Name: FOOTBALL_DATA_API_KEY
Value: dced7ecf... (your actual key from .env.local)
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: RAPIDAPI_KEY
Value: d9bfe10bf0msh72b2a653ecfde67p160769jsnb1550a1600a6
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Variable Name: RAPIDAPI_HOST
Value: sportapi7.p.rapidapi.com
Environments: ✓ Production ✓ Preview ✓ Development
```

### Step 2: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~2-3 minutes)

### Step 3: Verify

Visit these URLs to check if APIs are working:

- https://sureodds-app-tau.vercel.app/category/epl
- https://sureodds-app-tau.vercel.app/category/la-liga

You should see:
- ✅ Standings table with teams
- ✅ Upcoming fixtures
- ✅ Top scorers table
- ✅ Recent matches in the ticker

---

## What Each API Does

| API | Used For | Pages Affected |
|-----|----------|----------------|
| Football-Data.org | Standings, fixtures, results, top scorers, lineups | All league pages, match details |
| RapidAPI (SportAPI7) | Head-to-head stats | Match detail pages, H2H section |
| WordPress | News articles, blog posts | Homepage, category pages, article pages |

---

## If Still Not Working

### Check 1: Verify Variables Are Set
```bash
# In Vercel dashboard, go to Settings → Environment Variables
# You should see all 3 variables listed
```

### Check 2: Check Deployment Logs
```bash
# In Vercel dashboard, go to Deployments
# Click on the latest deployment
# Check "Build Logs" and "Function Logs" for errors
```

### Check 3: Test API Keys Locally
```bash
cd sureodds-app
node test-football-data.mjs
node test-new-features.mjs
```

If these work locally but not on Vercel, the issue is with environment variables.

---

## Common Issues

### Issue: "API key missing" error
**Solution:** Environment variables not set in Vercel. Follow Step 1 above.

### Issue: Empty standings/fixtures
**Solution:** API rate limit exceeded. Wait 1 minute and refresh.

### Issue: 500 error on match pages
**Solution:** Match ID might be invalid or API returned unexpected format.

---

## Quick Commands

```bash
# Check if environment variables are set (locally)
cat .env.local

# Test APIs locally
node test-football-data.mjs

# Deploy to Vercel
git add .
git commit -m "Update deployment"
git push

# Or use Vercel CLI
vercel --prod
```

---

## Support

- Vercel Docs: https://vercel.com/docs/environment-variables
- Football-Data.org: https://www.football-data.org/documentation/api
- RapidAPI: https://rapidapi.com/sportcontentapi/api/sport-api7
