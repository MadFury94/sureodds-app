# Headless CMS Setup - WordPress Integration

## Overview
Your Next.js application now uses WordPress as a headless CMS and user database. This setup allows you to:
- Keep existing WordPress users with their current access levels
- Manage new user registrations through the Next.js admin dashboard
- Auto-approve subscribers while requiring manual approval for punters

## User Flow

### New User Registration
1. **Subscribers** (regular users):
   - Register via OTP authentication
   - Automatically approved and activated
   - Receive subscription expiry date based on settings
   - Get welcome email immediately
   - Can access the platform right away

2. **Punters** (content creators):
   - Register via OTP authentication
   - Status set to "pending" - requires manual admin approval
   - Admin receives notification email
   - Cannot access platform until approved
   - After approval, can post predictions/tips

### Existing WordPress Users
- All existing WordPress users retain their access
- Users with roles: administrator, editor, author → mapped to "tips-admin" role
- Users with role: subscriber → mapped to "subscriber" role
- Users with role: punter → mapped to "punter" role
- Existing users without `user_status` meta field are automatically set to "active"

## Role Mapping

| WordPress Role | Next.js Role | Access Level | Auto-Approved |
|---------------|--------------|--------------|---------------|
| Administrator | tips-admin   | Full admin access | Yes (existing users) |
| Editor        | tips-admin   | Full admin access | Yes (existing users) |
| Author        | tips-admin   | Full admin access | Yes (existing users) |
| Subscriber    | subscriber   | View content | Yes |
| Punter        | punter       | Post predictions | No (manual approval) |

## Admin Dashboard Features

### User Management
- View all users from WordPress
- Approve/suspend punters
- See user status, role, and subscription expiry
- Existing WordPress users show as "active" automatically

### What You Can Do
- Approve new punter registrations
- Suspend users
- View user statistics
- Manage subscription expiries

### What Requires WordPress Admin Panel
- Delete users (must be done in WordPress)
- Change user roles (must be done in WordPress)
- Manage WordPress content (posts, pages)

## Environment Variables Required

```env
# WordPress API
NEXT_PUBLIC_WP_API=https://sureodds.ng/wp-json/wp/v2

# WordPress Admin Credentials (for API access)
WP_ADMIN_USER=your_wordpress_admin_username
WP_ADMIN_PASSWORD=your_wordpress_admin_password

# JWT Secret (for session tokens)
JWT_SECRET=your_secret_key_at_least_32_characters

# Email Configuration (for OTP and notifications)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

## WordPress Setup

### 1. Install JWT Authentication Plugin
Install and activate the "JWT Authentication for WP REST API" plugin in WordPress.

### 2. Configure .htaccess
Add to your WordPress `.htaccess`:
```apache
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

### 3. Add Punter Role
Add this to your WordPress theme's `functions.php` or a custom plugin:
```php
add_role('punter', 'Punter', array(
    'read' => true,
));
```

## How It Works

### Registration Flow
1. User enters email and name
2. OTP sent to email
3. User verifies OTP
4. User created in WordPress with appropriate role
5. If subscriber: auto-approved, welcome email sent
6. If punter: pending status, admin notification sent

### Login Flow
1. User enters email
2. OTP sent to email
3. User verifies OTP
4. WordPress user fetched
5. If suspended: access denied
6. If active: session created, user logged in

### Admin Approval Flow (Punters Only)
1. Admin receives email notification
2. Admin logs into Next.js dashboard
3. Admin views pending punters
4. Admin clicks "Approve"
5. User status updated in WordPress
6. Subscription expiry set (if applicable)
7. Approval email sent to user

## Benefits of This Setup

1. **Centralized User Database**: All users stored in WordPress
2. **Existing Users Protected**: Current WordPress users keep their access
3. **Flexible Role Management**: Easy to add new roles in WordPress
4. **Scalable**: Works on Vercel (no file system dependency)
5. **Secure**: Uses WordPress REST API with JWT authentication
6. **Automated Workflows**: Subscribers auto-approved, punters require review

## Next Steps

To add full admin capabilities to the Next.js dashboard:
1. Add WordPress post management (create, edit, delete posts)
2. Add media library management
3. Add category/tag management
4. Add comment moderation
5. Add analytics dashboard

All of these can be implemented using the WordPress REST API.
