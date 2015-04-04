<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}

if (! function_exists ( 'yoimg_search_print_media_templates' )) {
	function yoimg_search_print_media_templates() {
		?>
	<script type="text/html" id="tmpl-yoimages-search">
	<label class="yoimages-search-label">
		<input type="text" name="yoimg-search-query" class="yoimg-search-query" value="{{ data.searchQuery }}" />
		<span class="spinner" />
	</label>
	</script>
	<script type="text/html" id="tmpl-yoimages-search-results">
<# if ( data && data.foundImages === 0 ) { #>
	[TODO] no results found
<# } else if ( data && data.foundImages === 'error' ) { #>
	[TODO] error
<# } else if ( data && data.foundImages && data.foundImages.length ) { #>
	<ul>
		<# _.each( data.foundImages, function(image) {
			var dataUrl = image.large_url;
			#>
			<li class="spinner yoimages-search-result" data-url="{{dataUrl}}">
				<img src="{{image.url}}" data-url="{{dataUrl}}" />
				<a class="check" href="#" title="Deselect" data-url="{{dataUrl}}">
					<div class="media-modal-icon" data-url="{{dataUrl}}"></div>
				</a>
			</li>
		<# } ) #>
	</ul>
<# } #>
	</script>
	<?php
	}
	add_action ( 'admin_footer', 'yoimg_search_print_media_templates' );
}
