//TODO: propagate search tab to all media library frames

jQuery(document).ready(function() {
	if (wp && wp.media && wp.media.view && wp.media.view.MediaFrame && wp.media.view.MediaFrame.Select) {
		window.originalWpMedia = wp.media;
		wp.media.view.YoimgSearchResults = wp.media.View.extend({
			tagName : 'div',
			className : 'yoimages-search-results',
			template : wp.media.template('yoimages-search-results'),
			events : {
				'click .yoimages-search-result' : 'selectImage',
				'click .yoimages-search-result-sel' : 'selectImage'
			},
			initialize : function() {
				_.defaults(this.options, {
					multipleSelection : false
				});
				if (!this.model.get('yoimgSearchFoundImages')) {
					this.model.set('yoimgSearchImages', []);
				}
				this.model.on('change:yoimgSearchResults', this.showResults, this);
				this.model.on('change:yoimgSearchFoundImages', this.render, this);
				this.model.on('change:yoimgSearchImages', this.refreshSelections, this);
			},
			prepare : function() {
				var foundImages = this.model.get('yoimgSearchFoundImages');
				var data = {
					foundImages : foundImages
				};
				return data;
			},
			render : function() {
				wp.media.View.prototype.render.apply(this, arguments);
				this.refreshSelections();
				return this;
			},
			showResults : function() {
				var results = this.model.get('yoimgSearchResults');
				if (results && results.images && results.images.length > 0) {
					this.model.set('yoimgSearchFoundImages', results.images);
				} else if (results && results.errorThrown) {
					this.model.set('yoimgSearchFoundImages', results.textStatus);
				} else {
					this.model.set('yoimgSearchFoundImages', 0);
				}
			},
			selectImage : function(e) {
				if (e && e.target) {
					e.preventDefault();
					var $el = jQuery(e.target);
					var imgUrl = $el.attr('data-url');
					if (_.contains(this.model.get('yoimgSearchImages'), imgUrl)) {
						this.removeImage(imgUrl);
					} else {
						this.addImage(imgUrl);
					}
					return false;
				}
			},
			addImage : function(imgUrl) {
				var selectedImages = _.clone(this.model.get('yoimgSearchImages'));
				if (!this.options.multipleSelection) {
					selectedImages = [];
				}
				selectedImages.push(imgUrl);
				this.model.set('yoimgSearchImages', selectedImages);
			},
			removeImage : function(imgUrl) {
				var selectedImages = _.filter(_.clone(this.model.get('yoimgSearchImages')), function(item) {
					return item !== imgUrl;
				});
				this.model.set('yoimgSearchImages', selectedImages);
			},
			refreshSelections : function() {
				var selectedImages = this.model.get('yoimgSearchImages');
				var searchResults = this.$el.find('.yoimages-search-result').removeClass('selected');
				for (var i = 0; i < selectedImages.length; i++) {
					searchResults.filter('[data-url="' + selectedImages[i] + '"]').addClass('selected');
				}
			}
		});
		wp.media.view.YoimgSearchQuery = wp.media.View.extend({
			tagName : 'div',
			className : 'yoimages-search-query',
			template : wp.media.template('yoimages-search'),
			events : {
				'change .yoimg-search-query' : 'newSearchQuery',
				'click .yoimg-search-query' : 'newSearchQuery',
				'keyup .yoimg-search-query' : 'newSearchQuery'
			},
			prepare : function() {
				var searchQuery = this.model.get('yoimgSearchQuery');
				var data = {
					searchQuery : searchQuery
				};
				return data;
			},
			newSearchQuery : function() {
				this.model.set('yoimgSearchQuery', event.target.value);
			},
			doSearch : function() {
				clearTimeout(this.searchTimeout);
				var searchQuery = this.model.get('yoimgSearchQuery');
				this.searchTimeout = setTimeout(_.bind(function() {
					if (searchQuery && searchQuery.length > 1 && searchQuery === this.model.get('yoimgSearchQuery')) {
						var spinner = this.$('.yoimages-search-label .spinner').show();
						var model = this.model;
						jQuery.ajax({
							dataType : 'json',
							url : 'http://www.splashbase.co/api/v1/images/search',
							data : {
								query : searchQuery
							},
							success : function(data) {
								model.set('yoimgSearchResults', data);
							},
							error : function(jqXHR, textStatus, errorThrown) {
								model.set('yoimgSearchResults', {
									textStatus : textStatus,
									errorThrown : errorThrown
								});
							},
							complete : function() {
								spinner.hide();
							}
						});
					}
				}, this), 1000);
			},
			initialize : function() {
				this.model.on('change:yoimgSearchQuery', this.doSearch, this);
			}
		});
		wp.media.view.YoimgSearch = wp.media.View.extend({
			tagName : 'div',
			className : 'yoimages-search',
			initialize : function() {
				this.search = new wp.media.view.YoimgSearchQuery({
					controller : this.controller,
					model : this.model
				}).render();
				this.results = new wp.media.view.YoimgSearchResults({
					controller : this.controller,
					model : this.model,
					multipleSelection : true
				}).render();
				this.views.set([ this.search, this.results ]);
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