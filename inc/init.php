<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}

if (is_admin ()) {
	define ( 'YOIMG_SEARCH_PATH', dirname ( __FILE__ ) );
	define ( 'YOIMG_DEFAULT_SEARCH_ENABLED', TRUE );
	$yoimg_search_settings = get_option ( 'yoimg_search_settings' );
	define ( 'YOIMG_SEARCH_ENABLED', $yoimg_search_settings && isset ( $yoimg_search_settings ['search_is_active'] ) ? $yoimg_search_settings ['search_is_active'] : YOIMG_DEFAULT_SEARCH_ENABLED );
	if (YOIMG_SEARCH_ENABLED) {
	}
}
