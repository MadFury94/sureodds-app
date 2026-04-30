/**
 * Title: SureOdds Bet Codes Custom Post Type
 * Description: Registers bet codes custom post type with REST API support for Next.js integration
 * Code Snippets Plugin: Run everywhere
 */

// Register Bet Codes Custom Post Type with custom capabilities
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
        'show_in_rest'          => true,
        'rest_base'             => 'bet-codes',
        'query_var'             => true,
        'rewrite'               => array('slug' => 'bet-code'),
        'capability_type'       => array('bet_code', 'bet_codes'),
        'map_meta_cap'          => true,
        'has_archive'           => true,
        'hierarchical'          => false,
        'menu_position'         => 20,
        'menu_icon'             => 'dashicons-tickets-alt',
        'supports'              => array('title', 'editor', 'author', 'custom-fields'),
        'capabilities'          => array(
            'edit_post'          => 'edit_bet_code',
            'read_post'          => 'read_bet_code',
            'delete_post'        => 'delete_bet_code',
            'edit_posts'         => 'edit_bet_codes',
            'edit_others_posts'  => 'edit_others_bet_codes',
            'publish_posts'      => 'publish_bet_codes',
            'read_private_posts' => 'read_private_bet_codes',
            'create_posts'       => 'edit_bet_codes',
        ),
    );

    register_post_type('bet_code', $args);
}
add_action('init', 'register_bet_codes_cpt');

// Grant bet code capabilities to specific roles
function add_bet_code_capabilities() {
    // Get roles
    $admin = get_role('administrator');
    $editor = get_role('editor');
    $author = get_role('author');
    $contributor = get_role('contributor');
    $subscriber = get_role('subscriber');
    $punter = get_role('punter'); // Custom punter role
    $seo_editor = get_role('wpseo_editor');
    $seo_manager = get_role('wpseo_manager');
    
    // Capabilities to add
    $caps = array(
        'edit_bet_code',
        'read_bet_code',
        'delete_bet_code',
        'edit_bet_codes',
        'edit_others_bet_codes',
        'publish_bet_codes',
        'read_private_bet_codes',
        'delete_bet_codes',
        'delete_private_bet_codes',
        'delete_published_bet_codes',
        'delete_others_bet_codes',
        'edit_private_bet_codes',
        'edit_published_bet_codes',
    );
    
    // Add all capabilities to Administrator
    if ($admin) {
        foreach ($caps as $cap) {
            $admin->add_cap($cap);
        }
    }
    
    // Add all capabilities to Editor
    if ($editor) {
        foreach ($caps as $cap) {
            $editor->add_cap($cap);
        }
    }
    
    // Add basic capabilities to Author, Contributor, Subscriber, and Punter
    $basic_caps = array(
        'edit_bet_code',
        'read_bet_code',
        'delete_bet_code',
        'edit_bet_codes',
        'publish_bet_codes',
    );
    
    foreach (array($author, $contributor, $subscriber, $punter) as $role) {
        if ($role) {
            foreach ($basic_caps as $cap) {
                $role->add_cap($cap);
            }
        }
    }
}
add_action('admin_init', 'add_bet_code_capabilities');

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
