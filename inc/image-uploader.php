<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}
function yoimg_search_upload_images() {
	$post_id = esc_html ( $_POST ['postId'] );
	if (current_user_can ( 'upload_files' ) && current_user_can ( 'edit_post', $post_id )) {
		
		header ( 'Content-type: application/json; charset=UTF-8' );
		$images_urls = $_POST ['imagesUrls'];
		status_header ( 200 );
		$res = json_encode ( array (
				'postId' => $post_id,
				'tmp_count' => count ( $images_urls ) 
		) );
		echo $res;
	} else {
		status_header ( 401 );
	}
	die ();
}

add_action ( 'wp_ajax_yoimg_search_upload_images', 'yoimg_search_upload_images' );