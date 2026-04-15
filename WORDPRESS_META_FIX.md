# WordPress Meta Field Not Saving - Fix Required

## Problem
When admin approves a user, the status changes to "active" in the UI, but after refresh it goes back to "pending". The WordPress `user_status` meta field is not being saved.

## Root Cause
WordPress REST API requires custom meta fields to be registered before they can be updated via the API. Without registration, WordPress silently ignores the meta field updates.

## Solution Options

### Option 1: Register Meta Fields in WordPress (Recommended)
Add this code to your WordPress theme's `functions.php` file:

```php
// Register custom user meta fields for REST API
add_action('init', function() {
    register_meta('user', 'user_status', array(
        'type' => 'string',
        'description' => 'User account status',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return current_user_can('edit_users');
        }
    ));
    
    register_meta('user', 'subscription_expiry', array(
        'type' => 'string',
        'description' => 'Subscription expiry date',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return current_user_can('edit_users');
        }
    ));
    
    register_meta('user', 'approved_at', array(
        'type' => 'string',
        'description' => 'Approval timestamp',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return current_user_can('edit_users');
        }
    ));
    
    register_meta('user', 'approved_by', array(
        'type' => 'string',
        'description' => 'Approved by admin',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function() {
            return current_user_can('edit_users');
        }
    ));
});
```

**Steps:**
1. Log into WordPress admin panel
2. Go to Appearance → Theme File Editor
3. Select `functions.php` from the right sidebar
4. Add the code above at the end of the file
5. Click "Update File"
6. Test user approval again

### Option 2: Use WordPress Plugin
Create a simple WordPress plugin to register the meta fields:

1. Create file: `wp-content/plugins/sureodds-meta/sureodds-meta.php`
2. Add this content:

```php
<?php
/**
 * Plugin Name: Sureodds User Meta
 * Description: Registers custom user meta fields for Sureodds app
 * Version: 1.0
 * Author: Sureodds
 */

add_action('init', function() {
    $meta_fields = [
        'user_status' => 'User account status',
        'subscription_expiry' => 'Subscription expiry date',
        'approved_at' => 'Approval timestamp',
        'approved_by' => 'Approved by admin',
    ];
    
    foreach ($meta_fields as $key => $description) {
        register_meta('user', $key, [
            'type' => 'string',
            'description' => $description,
            'single' => true,
            'show_in_rest' => true,
            'auth_callback' => function() {
                return current_user_can('edit_users');
            }
        ]);
    }
});
```

3. Activate the plugin in WordPress admin

### Option 3: Use update_user_meta Directly (Requires WordPress Plugin)
If REST API meta updates don't work, create a custom WordPress endpoint:

```php
// Add to functions.php or plugin
add_action('rest_api_init', function() {
    register_rest_route('sureodds/v1', '/users/(?P<id>\d+)/meta', [
        'methods' => 'POST',
        'callback' => 'sureodds_update_user_meta',
        'permission_callback' => function() {
            return current_user_can('edit_users');
        }
    ]);
});

function sureodds_update_user_meta($request) {
    $user_id = $request['id'];
    $meta = $request->get_json_params();
    
    foreach ($meta as $key => $value) {
        update_user_meta($user_id, $key, $value);
    }
    
    return new WP_REST_Response([
        'success' => true,
        'user_id' => $user_id
    ], 200);
}
```

Then update the Next.js code to use this endpoint.

## Temporary Workaround (Current Implementation)
The current code returns the updated status from the API response, which updates the UI immediately. However, on page refresh, it fetches from WordPress and gets the old status.

## Testing After Fix

1. **Add the code to WordPress** (Option 1 or 2)
2. **Test approval:**
   - Go to admin dashboard users page
   - Click "Approve" on a pending user
   - User should show as "active"
3. **Refresh the page** (F5)
4. **User should still show as "active"** ✅

## Verification

Check server console logs when approving:

**Before fix:**
```
📝 [updateUser] Setting user_status to: active
✅ [updateUser] WordPress response: { meta: {} }
⚠️ [updateUser] WARNING: user_status not saved correctly!
⚠️ [updateUser] Expected: active
⚠️ [updateUser] Got: undefined
```

**After fix:**
```
📝 [updateUser] Setting user_status to: active
✅ [updateUser] WordPress response: { meta: { user_status: "active" } }
✅ [updateUser] Returning user: { status: "active" }
```

## Alternative: Store Status in WordPress Roles
Instead of using meta fields, you could use WordPress roles:
- `pending_punter` role for pending punters
- `punter` role for active punters
- `suspended_punter` role for suspended punters

This would work with REST API without registration, but requires more code changes.

## Files Modified
- ✅ `src/lib/auth-wordpress.ts` - Added better logging and error handling
- ⏳ WordPress `functions.php` - Needs meta field registration (manual step)

## Next Steps
1. Add the meta field registration code to WordPress
2. Test user approval
3. Verify status persists after page refresh
4. Share server console logs if still not working
