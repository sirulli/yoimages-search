<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}

if (! function_exists ( 'yoimg_search_load_providers_scripts' )) {
	function yoimg_search_load_providers_scripts() {
		global $yoimg_search_providers;
		if (YOIMG_SEARCH_ENABLED) {
			$search_providers = apply_filters ( 'yoimg_search_providers', array () );
			$providers_count = 0;
			$yoimg_search_providers = $search_providers;
			foreach ( $search_providers as $search_provider ) {
				$provder_id = 'yoimg-search-provider' . $providers_count;
				wp_register_script ( $provder_id, $search_provider['js'], array (
						'yoimg-search-js'
				), false, true );
				wp_enqueue_script ( $provder_id );
				$providers_count++;
			}
		}
	}
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

if (! function_exists ( 'yoimg_search_load_splashbase_provider' )) {
	function yoimg_search_load_splashbase_provider( $search_providers ) {
		array_push( $search_providers, array(
				'js' => YOIMG_SEARCH_URL . '/js/providers/yoimg-search-splashbase.js',
				'url' => 'http://www.splashbase.co/',
				'name' => 'Splashbase'
		) );
		return $search_providers;
	}
}

if (! function_exists ( 'yoimg_search_load_unsplash_provider' )) {
	function yoimg_search_load_unsplash_provider( $search_providers ) {
		array_push( $search_providers, array(
				'js' => YOIMG_SEARCH_URL . '/js/providers/yoimg-search-unsplash.js',
				'url' => 'https://unsplash.com/',
				'name' => 'Unsplash'
		) );
		return $search_providers;
	}
}
	
if (is_admin () || php_sapi_name () == 'cli') {
	define ( 'YOIMG_SEARCH_PATH', dirname ( __FILE__ ) );
	define ( 'YOIMG_SEARCH_URL', plugins_url ( plugin_basename ( YOIMG_SEARCH_PATH ) ) );
	define ( 'YOIMG_DEFAULT_SEARCH_ENABLED', TRUE );
	$yoimg_search_settings = get_option ( 'yoimg_search_settings' );
	define ( 'YOIMG_SEARCH_ENABLED', $yoimg_search_settings && isset ( $yoimg_search_settings ['search_is_active'] ) ? $yoimg_search_settings ['search_is_active'] : YOIMG_DEFAULT_SEARCH_ENABLED );
	if (YOIMG_SEARCH_ENABLED) {
		add_filter( 'yoimg_search_providers', 'yoimg_search_load_splashbase_provider' );
		add_filter( 'yoimg_search_providers', 'yoimg_search_load_unsplash_provider' );
		add_action ( 'admin_enqueue_scripts', 'yoimg_search_load_styles_and_scripts' );
		add_action ( 'admin_enqueue_scripts', 'yoimg_search_load_providers_scripts' );
		require_once (YOIMG_SEARCH_PATH . '/media-template.php');
		require_once (YOIMG_SEARCH_PATH . '/image-uploader.php');
	}
	require_once (YOIMG_SEARCH_PATH . '/extend-yoimg-settings.php');
}