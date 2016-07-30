<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}
function yoimg_search_extend_settings($settings) {
	$search_settings = array (
			'option' => array (
					'page' => 'yoimages-search',
					'title' => __ ( 'Free stock images search', YOIMG_DOMAIN ),
					'option_group' => 'yoimages-search-group',
					'option_name' => 'yoimg_search_settings',
					'sanitize_callback' => 'yoimg_search_settings_sanitize_search',
					'sections' => array (
							array (
									'id' => 'yoimg_search_options_section',
									'title' => __ ( 'Free stock images search', YOIMG_DOMAIN ),
									'callback' => 'yoimg_search_settings_section_info',
									'fields' => array (
											array (
													'id' => 'search_is_active',
													'title' => __ ( 'Enable', YOIMG_DOMAIN ),
													'callback' => 'yoimg_search_settings_search_is_active_callback' 
											) 
									) 
							) 
					) 
			) 
	);
	array_push ( $settings, $search_settings );
	return $settings;
}
add_filter ( 'yoimg_settings', 'yoimg_search_extend_settings', 10, 1 );


function yoimg_search_settings_section_info() {
	global $yoimg_search_providers;
	print __('Free stock images search settings.<br/>Please note that searches are performed in english therefore use english search terms.', YOIMG_DOMAIN );
	if ( isset( $yoimg_search_providers ) && ! empty( $yoimg_search_providers ) && is_array( $yoimg_search_providers ) ) {
		print '<br /><br />';
		print __('Images sources:', YOIMG_DOMAIN );
		print '<ul>';
		foreach ( $yoimg_search_providers as $yoimg_search_provider ) {
			print '<li><a href="' . $yoimg_search_provider['url'] . '" target="_blank">' . $yoimg_search_provider['name'] . '</a>,';
			print __('see T&C for more info.', YOIMG_DOMAIN );
			print '</li>';
		}
		print '</ul>';
	}
}

function yoimg_search_settings_search_is_active_callback() {
	$search_options = get_option( 'yoimg_search_settings' );
	printf(
	'<input type="checkbox" id="search_is_active" name="yoimg_search_settings[search_is_active]" value="TRUE" %s />
		<p class="description">' . __( 'If checked free stock images search is active', YOIMG_DOMAIN ) . '</p>',
				$search_options['search_is_active'] ? 'checked="checked"' : ( YOIMG_DEFAULT_SEARCH_ENABLED && ! isset( $search_options['search_is_active'] ) ? 'checked="checked"' : '' )
	);
}

function yoimg_search_settings_sanitize_search( $input ) {
	$new_input = array();
	if( isset( $input['search_is_active'] ) && ( $input['search_is_active'] === 'TRUE' || $input['search_is_active'] === TRUE ) ) {
		$new_input['search_is_active'] = TRUE;
	} else {
		$new_input['search_is_active'] = FALSE;
	}
	return $new_input;
}
