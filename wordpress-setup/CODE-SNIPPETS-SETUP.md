# Setup Bet Codes Using Code Snippets Plugin

## Step 1: Install Code Snippets Plugin (if not already installed)

1. Log in to WordPress admin: `https://sureodds.ng/wp-admin`
2. Go to **Plugins → Add New**
3. Search for **"Code Snippets"**
4. Install and activate the plugin by **Code Snippets Pro**

## Step 2: Add the Bet Codes Snippet

1. In WordPress admin, go to **Snippets → Add New**

2. **Title**: `SureOdds Bet Codes Custom Post Type`

3. **Code**: Copy and paste the ENTIRE content from `wordpress-setup/code-snippet-bet-codes.php`

4. **Settings**:
   - **Run snippet everywhere**: ✅ (checked)
   - **Only run in administration area**: ❌ (unchecked)
   - **Only run on site front-end**: ❌ (unchecked)

5. **Tags** (optional): Add tags like `custom-post-type`, `bet-codes`, `rest-api`

6. **Description** (optional): 
   ```
   Registers bet codes custom post type with REST API support for Next.js integration.
   Includes custom fields for bookmaker, code, link, odds, category, and more.
   ```

7. Click **Save Changes and Activate**

## Step 3: Verify It's Working

1. Refresh your WordPress admin page

2. You should see a new menu item **"Bet Codes"** with a ticket icon (🎫)

3. Click on it to open the Bet Codes management page

4. Test the REST API by visiting in your browser:
   ```
   https://sureodds.ng/wp-json/wp/v2/bet-codes
   ```
   You should see `[]` (empty array) or existing bet codes

## Step 4: Flush Permalinks

1. Go to **Settings → Permalinks**
2. Click **Save Changes** (don't change anything, just save)
3. This flushes the rewrite rules and ensures the REST API endpoint works

## Step 5: Test from Next.js App

1. Make sure your `.env.local` has:
   ```
   NEXT_PUBLIC_WP_API=https://sureodds.ng/wp-json/wp/v2
   WP_ADMIN_USER=your_wordpress_username
   WP_ADMIN_PASSWORD=your_wordpress_password
   ```

2. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

3. Log in as a punter and try creating a bet code

4. Check WordPress admin → Bet Codes to see if it appears

## Troubleshooting

### Snippet won't activate
- Check for PHP syntax errors in the snippet
- Make sure you copied the ENTIRE content including the comment at the top
- Try deactivating other snippets temporarily

### "Bet Codes" menu doesn't appear
- Make sure the snippet is **Active** (green toggle)
- Clear WordPress cache if using a caching plugin
- Try logging out and back in to WordPress

### REST API returns 404
- Go to **Settings → Permalinks** and click **Save Changes**
- Check if the snippet is running: Go to **Snippets → All Snippets** and verify it's active
- Try deactivating and reactivating the snippet

### Can't create bet codes from Next.js
- Verify WordPress credentials in `.env.local`
- Check browser console for errors
- Check Vercel function logs for errors
- Verify the WordPress user has permission to create posts

## Managing Snippets

### To Edit the Snippet
1. Go to **Snippets → All Snippets**
2. Find "SureOdds Bet Codes Custom Post Type"
3. Click **Edit**
4. Make changes and click **Save Changes**

### To Deactivate Temporarily
1. Go to **Snippets → All Snippets**
2. Toggle the switch next to the snippet to **Inactive**

### To Delete
1. Go to **Snippets → All Snippets**
2. Hover over the snippet and click **Delete**
3. Confirm deletion

## What This Snippet Does

✅ Registers "Bet Codes" custom post type
✅ Enables REST API access at `/wp-json/wp/v2/bet-codes`
✅ Adds custom fields: bookmaker, code, link, image, odds, stake, expires_at, status, category, confidence, created_by_email
✅ Creates custom admin columns for easy management
✅ Makes columns sortable
✅ Adds category badges (🆓 Free, 🏦 Sure Banker, ⭐ Premium, 👑 VIP)

## Next Steps

After successful setup:
1. Test creating bet codes from your Next.js app
2. Verify they appear in WordPress admin
3. Deploy to Vercel
4. Delete the old `src/data/bet-codes.json` file (no longer needed)
