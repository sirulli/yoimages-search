jQuery(document).ready(function() {
	if (wp && wp.media && wp.media.view && wp.media.view.MediaFrame && wp.media.view.MediaFrame.Select) {
		window.originalWpMedia = wp.media;
		wp.media.view.MediaFrame.SelectWithYoimgSearch = wp.media.view.MediaFrame.Select.extend({
			bindHandlers : function() {
				this.on('content:render:yosearch', this.yoimgSearch, this);
				wp.media.view.MediaFrame.Select.prototype.bindHandlers.call(this);
			},
			browseRouter : function(routerView) {
				wp.media.view.MediaFrame.Select.prototype.browseRouter.call(this, routerView);
				routerView.set({
					yosearch : {
						text : 'Search', // TODO l10n.searchImagesTitle
						priority : 9
					}
				});
			},
			yoimgSearch : function() {
				if (console) {
					console.log('wheee we are ready to search with SelectWithYoimgSearch!');
				}
				// TODO tmp
				this.content.set(new wp.media.view.UploaderInline({
					controller : this
				}));
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