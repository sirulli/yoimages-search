<?php
function yoimg_print_media_templates() {
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
		<# _.each( data.foundImages, function(image) { #>
			<li data-url="{{image.url}}" data-large-url="{{image.large_url}}">{{image.url}}</li>
		<# } ) #>
	</ul>
<# } #>
</script>
<?php
}
add_action ( 'admin_footer', 'yoimg_print_media_templates' );
