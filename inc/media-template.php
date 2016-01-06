<?php
if (! defined ( 'ABSPATH' )) {
	die ( 'No script kiddies please!' );
}

if (! function_exists ( 'yoimg_search_print_media_templates' )) {
	function yoimg_search_print_media_templates() {
		?>
	<script type="text/html" id="tmpl-yoimages-search">
	<label class="yoimages-search-label">
		<input type="text" name="yoimg-search-query" class="yoimg-search-query" value="{{ data.searchQuery }}" placeholder="<?php _e('Search free stock images from', YOIMG_DOMAIN); ?> {{ data.enabledSearchProviders }}" />
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
			?> <b>{{ error.providerName }}</b>.
			</span>
			<span>
			<?php
			_e('An error has occurred, please try again later or check the console logs for further information', YOIMG_DOMAIN);
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
	<div class="yoimages-search-results-inner">
	<# _.each( data.foundImages.images, function(page, i) {
		if ( page && page.length ) {
			if ( i ) {
			#>
			<h3><?php _e('Page', YOIMG_DOMAIN); ?>: {{ (i + 1) }}</h3>
			<#
			}
		#>
	<ul>
		<# _.each( page, function(image) {
			var dataUrl = image.largeUrl;
			#>
			<li class="spinner yoimages-search-result" data-url="{{dataUrl}}">
				<div class="yoimages-search-result-container" data-url="{{dataUrl}}">
					<img src="{{image.url}}" data-url="{{dataUrl}}" />
					<a class="check" href="#" title="Deselect" data-url="{{dataUrl}}">
						<div class="media-modal-icon" data-url="{{dataUrl}}"></div>
					</a>
				</div>
				<span class="yoimages-search-result-about">
					<# if ( image.copyright ) { #>
					<?php _e('copyright', YOIMG_DOMAIN); ?>: {{image.copyright}}
					<span class="yoimages-search-result-about-sep">/</span>
					<# } #>
					<# if ( image.originSite ) { #>
					<?php _e('site', YOIMG_DOMAIN); ?>: {{image.originSite}}
					<span class="yoimages-search-result-about-sep">/</span>
					<# } #>
					<# if ( image.link ) { #>
					<?php _e('source', YOIMG_DOMAIN); ?>: <a href="{{image.link}}" target="_blank">{{image.providerName}}</a>
					<span class="yoimages-search-result-about-sep">/</span>
					<# } #>
					<# if ( image.author && ( image.author.name || image.author.nickname ) ) { #>
					<?php _e('author', YOIMG_DOMAIN); ?>: <a href="{{image.author.link}}" target="_blank">
						<# if ( image.author.name ) { #>
						{{image.author.name}}
						<# } else { #>
						{{image.author.nickname}}
						<# } #>
					</a>
					<span class="yoimages-search-result-about-sep">/</span>
					<# } #>
				</span>
			</li>
		<# } ) #>
		<li class="yoimages-search-result" />
		<li class="yoimages-search-result" />
		<li class="yoimages-search-result" />
	</ul>
	<# } #>
	<# } ) #>
	<# if ( data && data.loading) { #>
	<div class="yoimages-search-label">
		<span class="spinner is-active" />
	</div>
	<# } #>
	</div>
<# } #>
<# } #>
	</script>
	<?php
	}
	add_action ( 'admin_footer', 'yoimg_search_print_media_templates' );
}
