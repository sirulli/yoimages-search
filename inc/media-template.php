<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}

if (! function_exists ( 'yoimg_search_print_media_templates' )) {
	function yoimg_search_print_media_templates() {
		?>
	<script type="text/html" id="tmpl-yoimages-search">
	<label class="yoimages-search-label">
		<input type="text" name="yoimg-search-query" class="yoimg-search-query" value="{{ data.searchQuery }}" placeholder="<?php _e('Search free stock images from splashbase.co', YOIMG_DOMAIN); ?>" />
		<span class="spinner" />
	</label>
	</script>
	<script type="text/html" id="tmpl-yoimages-search-results">
<# if ( data && data.foundImages === 0 ) { #>
	<div class="yoimages-search-label error warning">
		<p>
			<?php
			_e('No results found for:', YOIMG_DOMAIN);
			?> <b>{{ data.searchQuery }}</b>
		</p>
	</div>
<# } else if ( data && data.foundImages === 'error' ) { #>
	<div class="yoimages-search-label error">
		<p>
			<?php
			_e('An error has occurred, please try again later or check the console logs for further information', YOIMG_DOMAIN);
			?>
		</p>
	</div>
<# } else if ( data && data.foundImages && data.foundImages.length ) {
		var extraStyle = data.foundImages.length === 1 ? '-webkit-column-break-inside: avoid;-moz-column-break-inside: avoid;-o-column-break-inside: avoid;-ms-column-break-inside: avoid;column-break-inside: avoid;' : '';
#>
	<ul>
		<# _.each( data.foundImages, function(image) {
			var dataUrl = image.large_url;
			#>
			<li class="spinner yoimages-search-result" data-url="{{dataUrl}}" style="{{extraStyle}}">
				<img src="{{image.url}}" data-url="{{dataUrl}}" />
				<a class="check" href="#" title="Deselect" data-url="{{dataUrl}}">
					<div class="media-modal-icon" data-url="{{dataUrl}}"></div>
				</a>
			</li>
		<# } ) #>
		<li class="yoimages-search-result" />
		<li class="yoimages-search-result" />
	</ul>
<# } #>
	</script>
	<?php
	}
	add_action ( 'admin_footer', 'yoimg_search_print_media_templates' );
}
