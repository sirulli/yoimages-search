<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}

if (! function_exists ( 'yoimg_search_load_styles_and_scripts' )) {
	function yoimg_search_load_styles_and_scripts($hook) {
		wp_enqueue_style ( 'yoimg-search-css', YOIMG_SEARCH_URL . '/css/yoimg-search.css' );
		wp_register_script ( 'yoimg-search-js', YOIMG_SEARCH_URL . '/js/yoimg-search.js', array (
				'media-views' 
		), false, true );
		$translation_array = array (
				'searchImagesTitle' => __ ( 'Search', YOIMG_DOMAIN ),
				'uploadImageButton' =>  __ ( 'Upload', YOIMG_DOMAIN )
		);
		wp_localize_script ( 'yoimg-search-js', 'l10n', $translation_array );
		wp_enqueue_script ( 'yoimg-search-js' );
	}
}

if (is_admin () || php_sapi_name () == 'cli') {
	define ( 'YOIMG_SEARCH_PATH', dirname ( __FILE__ ) );
	define ( 'YOIMG_SEARCH_URL', plugins_url ( plugin_basename ( YOIMG_SEARCH_PATH ) ) );
	define ( 'YOIMG_DEFAULT_SEARCH_ENABLED', TRUE );
	$yoimg_search_settings = get_option ( 'yoimg_search_settings' );
	define ( 'YOIMG_SEARCH_ENABLED', $yoimg_search_settings && isset ( $yoimg_search_settings ['search_is_active'] ) ? $yoimg_search_settings ['search_is_active'] : YOIMG_DEFAULT_SEARCH_ENABLED );
	if (YOIMG_SEARCH_ENABLED) {
		add_action ( 'admin_enqueue_scripts', 'yoimg_search_load_styles_and_scripts' );
		require_once (YOIMG_SEARCH_PATH . '/media-template.php');
		require_once (YOIMG_SEARCH_PATH . '/image-uploader.php');
	}
}