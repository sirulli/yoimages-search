//TODO: propagate search tab to all media library frames

jQuery(document).ready(function() {
	if (wp && wp.media && wp.media.view && wp.media.view.MediaFrame && wp.media.view.MediaFrame.Select) {
		window.originalWpMedia = wp.media;
		wp.media.view.YoimgSearch = wp.media.View.extend({
			tagName : 'div',
			className : 'yoimages-search',
			template : wp.media.template('yoimages-search'),

			events : {
				'click .close' : 'hide',
				'change .yoimg-search-query' : 'searchQuery',
				'click .yoimg-search-query' : 'searchQuery',
				'keyup .yoimg-search-query' : 'searchQuery'
			},

			searchQuery : function() {
				this.model.set('searchQuery', event.target.value);
			},
			performSearch : function() {
				var searchQuery = this.model.get('searchQuery');
				if (searchQuery) {
					console.log(searchQuery);
				} else {
					console.log('no search query');
				}
			},

			initialize : function() {
				_.defaults(this.options, {
					searchQuery : ''
				});
				if (_.isUndefined(this.options.postId)) {
					this.options.postId = wp.media.view.settings.post.id;
				}
				this.model.on('change:searchQuery', this.performSearch, this);
			},
			prepare : function() {
				var searchQuery = this.model.get('searchQuery');
				var data = {
					searchQuery : searchQuery
				};
				return data;
			},
			dispose : function() {
				if (this.disposing) {
					return wp.media.View.prototype.dispose.apply(this, arguments);
				}
				this.disposing = true;
				return this.remove();
			},
			remove : function() {
				var result = wp.media.View.prototype.remove.apply(this, arguments);
				_.defer(_.bind(this.refresh, this));
				return result;
			},
			refresh : function() {
			},
			ready : function() {
				return this;
			},
			show : function() {
				this.$el.removeClass('hidden');
			},
			hide : function() {
				this.$el.addClass('hidden');
			}
		});
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
						priority : 60
					}
				});
			},
			yoimgSearch : function() {
				this.content.set(new wp.media.view.YoimgSearch({
					controller : this,
					model : this.state()
				}));
			}
		});
		var mediaWithYoimgSearch = function(attributes) {
			var originalAttrs = _.clone(attributes);
			originalAttrs = _.defaults(originalAttrs || {}, {
				frame : 'select'
			});
			var frame = window.originalWpMedia(attributes);
			if ('select' === originalAttrs.frame && wp.media.view.MediaFrame.SelectWithYoimgSearch) {
				attributes = originalAttrs;
				frame = new wp.media.view.MediaFrame.SelectWithYoimgSearch(attributes);
			}
			delete attributes.frame;
			wp.media.frame = frame;
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