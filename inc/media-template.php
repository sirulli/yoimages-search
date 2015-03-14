<?php
function yoimg_print_media_templates() {
	?>
<script type="text/html" id="tmpl-yoimages-search">
	<div>wheee {{ data.message }}</div>
</script>
<?php
}
add_action ( 'admin_footer', 'yoimg_print_media_templates' );
