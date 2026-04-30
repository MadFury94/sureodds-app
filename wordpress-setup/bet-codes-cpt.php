<?php
/**
 * Bet Codes Custom Post Type
 * 
 * Add this code to your WordPress theme's functions.php file
 * or create it as a custom plugin
 */

// Register Bet Codes Custom Post Type
function register_bet_codes_cpt() {
    $labels = array(
        'name'                  => 'Bet Codes',
        'singular_name'         => 'Bet Code',
        'menu_name'             => 'Bet Codes',
        'add_new'               => 'Add New',
        'add_new_item'          => 'Add New Bet Code',
        'edit_item'             => 'Edit Bet Code',
        'new_item'              => 'New Bet Code',
        'view_item'             => 'View Bet Code',
        'search_items'          => 'Search Bet Codes',
        'not_found'             => 'No bet codes found',
        'not_found_in_trash'    => 'No bet codes found in trash',
    );

    $args = array(
        'labels'                => $labels,
        'public'                => true,
        'publicly_queryable'    => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'show_in_rest'          => true, // Enable REST API support
        'rest_base'             => 'bet-codes',
        'query_var'             => true,
        'rewrite'               => array('slug' => 'bet-code'),
        'capability_type'       => 'post',
        'has_archive'           => true,
        'hierarchical'          => false,
        'menu_position'         => 20,
        'menu_icon'             => 'dashicons-tickets-alt',
        'supports'              => array('title', 'editor', 'author', 'custom-fields'),
    );

    register_post_type('bet_code', $args);
}
add_action('init', 'register_bet_codes_cpt');

// Register custom fields for REST API
function register_bet_code_meta_fields() {
    // Bookmaker
    register_post_meta('bet_code', 'bookmaker', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));

    // Booking Code
    register_post_meta('bet_code', 'code', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));

    // Bet Slip Link
    register_post_meta('bet_code', 'link', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));

    // Bet Slip Image
    register_post_meta('bet_code', 'image', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));

    // Total Odds
    register_post_meta('bet_code', 'odds', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));

    // Recommended Stake
    register_post_meta('bet_code', 'stake', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));

    // Expires At
    register_post_meta('bet_code', 'expires_at', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));

    // Status (active, expired, won, lost)
    register_post_meta('bet_code', 'status', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => 'active',
    ));

    // Category (free, sure-banker, premium, vip)
    register_post_meta('bet_code', 'category', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => 'free',
    ));

    // Confidence Level
    register_post_meta('bet_code', 'confidence', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => 'Medium',
    ));

    // Created By Email
    register_post_meta('bet_code', 'created_by_email', array(
        'type'          => 'string',
        'single'        => true,
        'show_in_rest'  => true,
        'default'       => '',
    ));
}
add_action('init', 'register_bet_code_meta_fields');

// Add custom columns to admin list
function bet_code_custom_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'Description';
    $new_columns['bookmaker'] = 'Bookmaker';
    $new_columns['category'] = 'Category';
    $new_columns['odds'] = 'Odds';
    $new_columns['status'] = 'Status';
    $new_columns['author'] = 'Created By';
    $new_columns['date'] = 'Date';
    return $new_columns;
}
add_filter('manage_bet_code_posts_columns', 'bet_code_custom_columns');

// Populate custom columns
function bet_code_custom_column_content($column, $post_id) {
    switch ($column) {
        case 'bookmaker':
            echo esc_html(get_post_meta($post_id, 'bookmaker', true));
            break;
        case 'category':
            $category = get_post_meta($post_id, 'category', true);
            $badges = array(
                'free' => '🆓 Free',
                'sure-banker' => '🏦 Sure Banker',
                'premium' => '⭐ Premium',
                'vip' => '👑 VIP',
            );
            echo isset($badges[$category]) ? $badges[$category] : $category;
            break;
        case 'odds':
            echo esc_html(get_post_meta($post_id, 'odds', true));
            break;
        case 'status':
            $status = get_post_meta($post_id, 'status', true);
            $color = $status === 'active' ? 'green' : 'red';
            echo '<span style="color: ' . $color . '; font-weight: bold;">' . strtoupper($status) . '</span>';
            break;
    }
}
add_action('manage_bet_code_posts_custom_column', 'bet_code_custom_column_content', 10, 2);

// Make columns sortable
function bet_code_sortable_columns($columns) {
    $columns['bookmaker'] = 'bookmaker';
    $columns['category'] = 'category';
    $columns['status'] = 'status';
    return $columns;
}
add_filter('manage_edit-bet_code_sortable_columns', 'bet_code_sortable_columns');
