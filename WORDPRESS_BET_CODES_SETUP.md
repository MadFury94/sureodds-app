# WordPress Bet Codes Setup Guide

This guide will help you set up bet codes storage in WordPress instead of using local JSON files.

## Step 1: Add Custom Post Type to WordPress

You have two options:

### Option A: Add to Theme's functions.php (Recommended)

1. Log in to your WordPress admin at `https://sureodds.ng/wp-admin`
2. Go to **Appearance → Theme File Editor**
3. Select **functions.php** from the right sidebar
4. Scroll to the bottom of the file
5. Copy and paste the entire content from `wordpress-setup/bet-codes-cpt.php`
6. Click **Update File**

### Option B: Create a Custom Plugin

1. Create a new folder in `wp-content/plugins/` called `sureodds-bet-codes`
2. Create a file `sureodds-bet-codes.php` with this header:

```php
<?php
/**
 * Plugin Name: SureOdds Bet Codes
 * Description: Custom post type for managing bet codes
 * Version: 1.0.0
 * Author: SureOdds
 */

// Paste the content from wordpress-setup/bet-codes-cpt.php here
```

3. Go to **Plugins** in WordPress admin and activate the plugin

## Step 2: Verify Custom Post Type

1. After adding the code, refresh your WordPress admin
2. You should see a new menu item **"Bet Codes"** with a ticket icon
3. Click on it to verify it's working

## Step 3: Test the REST API

Open your browser and visit:
```
https://sureodds.ng/wp-json/wp/v2/bet-codes
```

You should see an empty array `[]` or existing bet codes if any.

## Step 4: Migrate Existing Bet Codes (Optional)

If you have existing bet codes in `src/data/bet-codes.json`, you can migrate them:

1. Go to **Bet Codes → Add New** in WordPress admin
2. For each bet code:
   - **Title**: `{Bookmaker} - {Description}`
   - **Content**: Full description
   - Scroll down to **Custom Fields** section
   - Add each field (bookmaker, code, link, odds, stake, category, etc.)
   - Click **Publish**

Or use the WordPress REST API to bulk import (requires technical knowledge).

## Step 5: Deploy to Vercel

Once WordPress is set up:

1. Commit the changes to your repository:
   ```bash
   git add src/app/api/bet-codes/
   git commit -m "feat: migrate bet codes storage to WordPress"
   git push
   ```

2. Vercel will automatically deploy the changes

3. Verify on production:
   - Visit your deployed site
   - Try creating a bet code as a punter
   - Check WordPress admin to see if it appears

## Features

### In WordPress Admin

- **Bet Codes** menu with custom columns:
  - Bookmaker
  - Category (Free, Sure Banker, Premium, VIP)
  - Odds
  - Status (Active, Expired, Won, Lost)
  - Created By
  - Date

- **Sortable columns** for easy management

- **Custom fields** for all bet code data

### In Next.js App

- ✅ Create bet codes (stored in WordPress)
- ✅ View bet codes (filtered by category/subscription)
- ✅ Update bet code status
- ✅ Delete bet codes (own codes or admin)
- ✅ Category-based access control
- ✅ Creator tracking

## Benefits

✅ **Production-ready**: Works on Vercel (no file system writes)
✅ **Scalable**: WordPress database handles concurrent requests
✅ **Persistent**: Data survives deployments
✅ **Manageable**: Edit bet codes directly in WordPress admin
✅ **Integrated**: Uses existing WordPress infrastructure
✅ **Backed up**: WordPress backup plugins work automatically

## Troubleshooting

### "Bet Codes" menu doesn't appear
- Clear WordPress cache (if using a caching plugin)
- Try deactivating and reactivating the theme/plugin
- Check for PHP errors in WordPress debug log

### REST API returns 404
- Go to **Settings → Permalinks** and click **Save Changes** (flushes rewrite rules)
- Verify the custom post type is registered: `show_in_rest => true`

### Can't create bet codes from Next.js
- Verify `WP_ADMIN_USER` and `WP_ADMIN_PASSWORD` in `.env.local`
- Check WordPress user has permission to create posts
- Check browser console and server logs for errors

## Next Steps

After setup is complete, you can:

1. Delete the old JSON file: `src/data/bet-codes.json`
2. Remove it from `.gitignore` if added
3. Test creating, viewing, and deleting bet codes
4. Set up WordPress backup plugin for data safety

## Support

If you encounter issues:
1. Check WordPress error logs
2. Check Vercel function logs
3. Verify WordPress REST API is accessible
4. Ensure WordPress user credentials are correct
