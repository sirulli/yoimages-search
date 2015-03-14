<?php
function yoimg_print_media_templates() {
	?>
<script type="text/html" id="tmpl-yoimages-search">
	<input type="text" name="yoimg-search-query" class="yoimg-search-query" value="{{ data.searchQuery }}" />
</script>
<?php
}
add_action ( 'admin_footer', 'yoimg_print_media_templates' );
