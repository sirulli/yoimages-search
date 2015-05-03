//TODO: propagate search tab to all media library frames

jQuery(document).ready(function() {
	if (wp && wp.media && wp.media.view && wp.media.view.MediaFrame && wp.media.view.MediaFrame.Select) {
		window.originalWpMedia = wp.media;
		wp.media.view.YoimgSearchResults = wp.media.View.extend({
			tagName : 'div',
			className : 'yoimages-search-results',
			template : wp.media.template('yoimages-search-results'),
			events : {
				'click .yoimages-search-result-container' : 'selectImage'
			},
			initialize : function() {
				if (!this.model.get('yoimgSearchFoundImages')) {
					this.model.set('yoimgSearchImages', []);
				}
				this.model.on('change:yoimgSearchResults', this.showResults, this);
				this.model.on('change:yoimgSearchFoundImages', this.render, this);
				this.model.on('change:yoimgSearching', this.render, this);
				this.model.on('change:yoimgSearchImages', this.refreshSelections, this);
			},
			prepare : function() {
				var foundImages = this.model.get('yoimgSearchFoundImages');
				var searchQuery = this.model.get('yoimgSearchQuery');
				var searching = this.model.get('yoimgSearching');
				var data = {
					foundImages : foundImages,
					searchQuery : searchQuery,
					searching : searching
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
				} else if (results && results.textStatus) {
					this.model.set('yoimgSearchFoundImages', results.textStatus);
				} else {
					this.model.set('yoimgSearchFoundImages', 0);
					this.render();
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
				if (!this.options.multiple) {
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
				this.model.set('yoimgSearchImages', []);
				var searchQuery = this.model.get('yoimgSearchQuery');
				this.searchTimeout = setTimeout(_.bind(function() {
					if (searchQuery && searchQuery.length > 1 && searchQuery === this.model.get('yoimgSearchQuery')) {
						this.model.set('yoimgSearching', true);
						var model = this.model;
						jQuery.ajax({
							dataType : 'json',
							url : 'http://www.splashbase.co/api/v1/images/search',
							data : {
								query : searchQuery
							},
							success : function(data) {
								if (!data) {
									data = {};
								}
								data.date = new Date();
								model.set('yoimgSearchResults', data);
							},
							error : function(jqXHR, textStatus, errorThrown) {
								if (console) {
									console.log('text status: ' + textStatus + ', error thrown: ' + errorThrown + ', error message from server: ' + jqXHR.responseText);
								}
								model.set('yoimgSearchResults', {
									textStatus : textStatus,
									errorThrown : errorThrown
								});
							},
							complete : function() {
								model.set('yoimgSearching', false);
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
					options : this.options
				}).render();
				this.views.set([ this.search, this.results ]);
			},
			dispose : function() {
				this._toolbar.options = _.clone(this._defaultToolbarOptions);
				this.model.set('yoimgSearchActive', false);
				return wp.media.View.prototype.dispose.apply(this, arguments);
			},
			render : function() {
				this._toolbar = this.controller.views.get('.media-frame-toolbar')[0];
				this._defaultToolbarOptions = _.clone(this._toolbar.options);
				this._toolbar.options.event = 'yoimg-search-select';
				this._toolbar.options.text = l10n.uploadImageButton;
				this._toolbar.options.close = false;
				this.model.set('yoimgSearchActive', true);
				return wp.media.View.prototype.render.apply(this, arguments);
			}
		});
		wp.media.view.Toolbar.SelectWithYoimgSearch = wp.media.view.Toolbar.Select.extend({
			initialize : function() {
				wp.media.view.Toolbar.Select.prototype.initialize.call(this);
				var state = this.controller.state();
				state.on('change:yoimgSearchActive', this.refresh, this);
				state.on('change:yoimgSearchImages', this.refresh, this);
				state.on('change:yoimgSearchSelecting', this.refresh, this);
			},
			refresh : function() {
				wp.media.view.Toolbar.Select.prototype.refresh.call(this);
				var state = this.controller.state();
				var yoimgSearchActive = state.get('yoimgSearchActive') === true;
				if (yoimgSearchActive) {
					var selectedImages = state.get('yoimgSearchImages');
					var selectingImages = state.get('yoimgSearchSelecting');
					var active = selectedImages && selectedImages.length && !selectingImages;
					_.each(this._views, function(button) {
						if (!button.model || !button.options || !button.options.requires) {
							return;
						}
						button.model.set('disabled', !active);
					});
				}
				var text = this.options.text;
				_.each(this._views, function(button) {
					if (!button || !button.model) {
						return;
					}
					button.model.set('text', text);
				});
			}
		});
		wp.media.view.MediaFrame.SelectWithYoimgSearch = wp.media.view.MediaFrame.Select.extend({
			bindHandlers : function() {
				this.on('content:render:yosearch', this.yoimgSearch, this);
				this.on('yoimg-search-select', this.yoimgSearchSelect, this);
				wp.media.view.MediaFrame.Select.prototype.bindHandlers.call(this);
			},
			browseRouter : function(routerView) {
				wp.media.view.MediaFrame.Select.prototype.browseRouter.call(this, routerView);
				routerView.set({
					yosearch : {
						text : l10n.searchImagesTitle,
						priority : 60
					}
				});
			},
			createSelectToolbar : function(toolbar, options) {
				options = options || this.options.button || {};
				options.controller = this;
				toolbar.view = new wp.media.view.Toolbar.SelectWithYoimgSearch(options);
			},
			yoimgSearch : function() {
				this.$el.removeClass('hide-toolbar');
				this.content.set(new wp.media.view.YoimgSearch({
					controller : this,
					model : this.state(),
					options : this.options
				}));
			},
			yoimgSearchSelectCb : function(res) {
				if (res && res.length) {
					for (var i = 0; i < res.length; i++) {
						var resItem = res[i];
						// TODO it's specific for featured image: make it more
						// general!
						wp.media.view.settings.post.featuredImageId = resItem.imageId;
					}
					this.state().updateSelection();
					this.content.mode('browse');
				}
			},
			yoimgSearchSelectCompleteCb : function() {
				var model = this.state();
				model.set('yoimgSearchImages', []);
				model.set('yoimgSearchSelecting', false);
				this.content.view.$el.find('.yoimages-search-spinner').remove();
			},
			yoimgSearchSelectErrorCb : function(jqXHR, textStatus, errorThrown) {
				var model = this.state();
				if (console) {
					console.log('text status: ' + textStatus + ', error thrown: ' + errorThrown + ', error message from server: ' + jqXHR.responseText);
				}
				model.set('yoimgSearchResults', {
					textStatus : textStatus,
					errorThrown : errorThrown
				});
			},
			yoimgSearchSelect : function() {
				var selectedImages = this.state().get('yoimgSearchImages');
				if (selectedImages && selectedImages.length > 0) {
					var data = {
						'action' : 'yoimg_search_upload_images',
						'postId' : wp.media.view.settings.post.id,
						'imagesUrls' : selectedImages
					};
					this.state().set('yoimgSearchSelecting', true);
					this.content.view.$el.find('.media-frame-toolbar .media-toolbar-primary.search-form').prepend('<span class="spinner is-active yoimages-search-spinner"></span>');
					jQuery.ajax({
						type : 'POST',
						url : ajaxurl,
						data : data,
						success : _.bind(this.yoimgSearchSelectCb, this),
						complete : _.bind(this.yoimgSearchSelectCompleteCb, this),
						error : _.bind(this.yoimgSearchSelectErrorCb, this)
					});
				}
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