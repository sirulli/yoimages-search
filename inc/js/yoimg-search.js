jQuery(document).ready(function() {
	if (wp && wp.media && wp.media.view && wp.media.view.MediaFrame && wp.media.view.MediaFrame.Select) {
		window.originalWpMedia = wp.media;
		wp.media.view.MediaFrame.SelectWithYoimgSearch = wp.media.view.MediaFrame.Select.extend({
			browseRouter : function(routerView) {
				console.log('wheee we are using SelectWithYoimgSearch!');
				return wp.media.view.MediaFrame.Select.prototype.browseRouter.call(this, routerView);
			}
		});
		var mediaWithYoimgSearch = function(attributes) {
			var frame = window.originalWpMedia(attributes);
			if (frame instanceof wp.media.view.MediaFrame.Select) {
				frame = new wp.media.view.MediaFrame.SelectWithYoimgSearch(attributes);
			}
			return frame;
		};
		jQuery.extend(mediaWithYoimgSearch, wp.media);
		wp.media = mediaWithYoimgSearch;
	} else {
		if (console) {
			console.log('error: cannot initialize yoimages search');
		}
	}
});