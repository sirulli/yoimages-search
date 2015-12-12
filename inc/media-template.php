<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}

if (! function_exists ( 'yoimg_search_print_media_templates' )) {
	function yoimg_search_print_media_templates() {
		?>
	<script type="text/html" id="tmpl-yoimages-search">
	<label class="yoimages-search-label">
		<input type="text" name="yoimg-search-query" class="yoimg-search-query" value="{{ data.searchQuery }}" placeholder="<?php _e('Search free stock images from www.splashbase.co', YOIMG_DOMAIN); ?>" />
	</label>
	</script>
	<script type="text/html" id="tmpl-yoimages-search-results">
<# if ( data && data.searching) { #>
	<div class="yoimages-search-label">
		<span class="spinner is-active" />
	</div>
<# } else { #>
<# if ( data && (data.foundImages === 0 || (data.foundImages && data.foundImages.images && data.foundImages.images.length === 0))) { #>
	<div class="yoimages-search-label error warning">
		<p>
			<?php
			_e('No results for:', YOIMG_DOMAIN);
			?> <b>{{ data.searchQuery }}</b>
		</p>
	</div>
<# } #>
<# if ( data && data.foundImages && data.foundImages.errors && data.foundImages.errors.length ) { #>
	<# _.each( data.foundImages.errors, function(error) { #>
	<div class="yoimages-search-label error">
		<p>
			<span>
			<?php
			_e('Cannot get results from:', YOIMG_DOMAIN);
			?> <b>{{ error.source }}</b>.
			</span>
			<span>
			<?php
			_e('Please try again later or check the console logs for further information', YOIMG_DOMAIN);
			?>
			</span>
		</p>
	</div>
	<# }) #>
<# } #>
<# if ( data && data.foundImages && data.foundImages.textStatus === 'no-search-providers' ) { #>
	<div class="yoimages-search-label error">
		<p>
			<?php
			_e('No search providers enabled, please select at least one search provider from the settings page', YOIMG_DOMAIN);
			?>
		</p>
	</div>
<# } #>
<# if ( data && data.foundImages && data.foundImages.images && data.foundImages.images.length ) { #>
	<ul>
		<# _.each( data.foundImages.images, function(image) {
			var dataUrl = image.large_url;
			#>
			<li class="spinner yoimages-search-result" data-url="{{dataUrl}}">
				<div class="yoimages-search-result-container" data-url="{{dataUrl}}">
					<img src="{{image.url}}" data-url="{{dataUrl}}" />
					<a class="check" href="#" title="Deselect" data-url="{{dataUrl}}">
						<div class="media-modal-icon" data-url="{{dataUrl}}"></div>
					</a>
				</div>
				<span class="yoimages-search-result-about"><?php _e('copyright', YOIMG_DOMAIN); ?>: {{image.copyright}}, <?php _e('site', YOIMG_DOMAIN); ?>: {{image.site}} <?php _e('via', YOIMG_DOMAIN); ?> <a href="http://www.splashbase.co/images/{{image.id}}" target="_blank">splashbase</a></span>
			</li>
		<# } ) #>
		<li class="yoimages-search-result" />
		<li class="yoimages-search-result" />
		<li class="yoimages-search-result" />
	</ul>
<# } #>
<# } #>
	</script>
	<?php
	}
	add_action ( 'admin_footer', 'yoimg_search_print_media_templates' );
}
