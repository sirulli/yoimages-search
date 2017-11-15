//TODO: propagate search tab to all media library frames

var YOIMG_SEARCH_STATES = ['insert', 'gallery', 'featured-image'];
var YOIMG_SEARCH_PROVIDERS = [];
var YOIMG_SEARCH_MAX_ITEMS_PER_PAGE = 20;
var YOIMG_SEARCH_ITEMS_PER_PAGE;
var YOIMG_SEARCH_CURR_PAGE;
var YoimgSearch = {
		registerProvider : function(provider) {
			YOIMG_SEARCH_PROVIDERS.push(provider);
			YOIMG_SEARCH_ITEMS_PER_PAGE = Math.floor(YOIMG_SEARCH_MAX_ITEMS_PER_PAGE / YOIMG_SEARCH_PROVIDERS.length);
		}
};

var YoimgSearchResult = function(providerName, images, error) {
	this.providerName = providerName;
	this.images = images;
	this.error = error;
};

var YoimgSearchResultImage = function(index, copyright, largeUrl, originSite, url, providerName, link, author) {
	this.index = index;
	this.copyright = copyright;
	this.largeUrl = largeUrl;
	this.originSite = originSite;
	this.url = url;
	this.providerName = providerName;
	this.link = link;
	this.author = author;
};

var YoimgSearchResultImageAuthor = function(name, nickname, link) {
	this.name = name;
	this.nickname = nickname;
	this.link = link;
};

var YoimgSearchResultError = function(textStatus, errorThrown, messageFromServer) {
	this.textStatus = textStatus;
	this.errorThrown = errorThrown;
	this.messageFromServer = messageFromServer;
};

jQuery(document).ready(function() {
	function getEnabledSearchProviders() {
		var res = "";
		for (var i = 0; i < YOIMG_SEARCH_PROVIDERS.length; i++) {
			res += YOIMG_SEARCH_PROVIDERS[i].name + ", ";
		}
		if (res.length) {
			res = res.substring(0, res.length - 2);
		}
		return res;
	};
	function whenAll(deferreds) {
		var lastResolved = 0;
		var wrappedDeferreds = [];
		for (var i = 0; i < deferreds.length; i++) {
			wrappedDeferreds.push(jQuery.Deferred());
			deferreds[i].always(function() {
				wrappedDeferreds[lastResolved++].resolve(arguments);
			});
		}
		return jQuery.when.apply(jQuery, wrappedDeferreds).promise();
	};
	function load(searchQuery, model, isPaginate) {
		if (isPaginate) {
			model.set('yoimgSearchLoading', true);
		} else {
			model.set('yoimgSearching', true);
		}
		YOIMG_SEARCH_CURR_PAGE++;
		var opts =  {
				itemsPerPage : YOIMG_SEARCH_ITEMS_PER_PAGE,
				page : YOIMG_SEARCH_CURR_PAGE
		};
		if (typeof YOIMG_SEARCH_PROVIDERS !== 'undefined' && YOIMG_SEARCH_PROVIDERS && YOIMG_SEARCH_PROVIDERS.length ) {
			var deferreds = [];
			_.each(YOIMG_SEARCH_PROVIDERS, function(provider) {
				var d = jQuery.Deferred();
				deferreds.push(d);
			});
			whenAll(deferreds).done(function() {
				if (isPaginate) {
					model.set('yoimgSearchLoading', false);
				} else {
					model.set('yoimgSearching', false);
				}
				var results = {
					images : [],
					errors : []
				};
				_.each(arguments, function(result) {
					if (!result || result.length < 1) {
						result = {};
					} else if (result[0].images && result[0].images.length) {
						results.images = results.images.concat(result[0].images);
					} else if (result[0].error) {
						var failure = result[0].error;
						if (console && console.error) {
							console.error('source: ' + result[0].providerName +  ', text status: ' + failure.textStatus + ', error thrown: ' + failure.errorThrown + ', error message from server: ' + failure.messageFromServer);
						}
						results.errors.push(result[0]);
					}
				});
				results.images.sort(function (a, b) {
					if (a.index > b.index) {
						return 1;
					}
					if (a.index < b.index) {
						return -1;
					}
					return 0;
				});
				results.date = new Date();
				var prevResults = model.get('yoimgSearchResults');
				if (isPaginate && prevResults && prevResults.images && prevResults.images.length) {
					results.images = prevResults.images.concat([results.images]);
				} else {
					results.images = results.images && results.images.length ? [results.images] : results.images;
				}
				model.set('yoimgSearchResults', results);
			});
			_.each(YOIMG_SEARCH_PROVIDERS, function(provider, i) {
				provider.invoke(searchQuery, deferreds[i], opts);
			});
		} else {
			model.set('yoimgSearchResults', {
				textStatus : 'no-search-providers'
			});
			if (isPaginate) {
				model.set('yoimgSearchLoading', false);
			} else {
				model.set('yoimgSearching', false);
			}
		}
	};
	if (wp && wp.media && wp.media.view && wp.media.view.MediaFrame && wp.media.view.MediaFrame.Select) {
		window.originalWpMedia = wp.media;
		wp.media.view.YoimgSearchResults = wp.media.View.extend({
			tagName : 'div',
			className : 'yoimages-search-results',
			template : wp.media.template('yoimages-search-results'),
			events : {
				'click .yoimages-search-result-container' : 'selectImage',
				'scroll' : 'scrolling'
			},
			initialize : function() {
				if (!this.model.get('yoimgSearchFoundImages')) {
					this.model.set('yoimgSearchImages', []);
				}
				this.model.on('change:yoimgSearchResults', this.showResults, this);
				this.model.on('change:yoimgSearchFoundImages', this.render, this);
				this.model.on('change:yoimgSearching', this.render, this);
				this.model.on('change:yoimgSearchLoading', this.render, this);
				this.model.on('change:yoimgSearchImages', this.refreshSelections, this);
			},
			prepare : function() {
				var foundImages = this.model.get('yoimgSearchFoundImages');
				var searchQuery = this.model.get('yoimgSearchQuery');
				var searching = this.model.get('yoimgSearching');
				var loading = this.model.get('yoimgSearchLoading');
				var data = {
					foundImages : foundImages,
					searchQuery : searchQuery,
					searching : searching,
					loading : loading
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
				if (results) {
					this.model.set('yoimgSearchFoundImages', results);
				} else {
					this.model.set('yoimgSearchFoundImages', 0);
					this.render();
				}
			},
			scrolling : function(e) {
				var model = this.model;
				if (! model.get('yoimgSearchLoading')) {
					var $el = jQuery(e.target);
					if ($el.hasClass('yoimages-search-results')) {
						var $innerEl = $el.find('.yoimages-search-results-inner');
						if ($el.scrollTop() + $el.height() > $innerEl.height() - 100) {
							var searchQuery = model.get('yoimgSearchQuery');
							load(searchQuery, model, true);
						}
					}
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
				if (!this.controller.options.multiple || !this.model.attributes.multiple) {
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
					searchQuery : searchQuery,
					enabledSearchProviders : getEnabledSearchProviders()
				};
				return data;
			},
			newSearchQuery : function(event) {
				this.model.set('yoimgSearchQuery', event.target.value);
			},
			doSearch : function() {
			    clearTimeout(this.searchTimeout);
			    var model = this.model;
				model.set('yoimgSearchImages', []);
				var searchQuery = model.get('yoimgSearchQuery');
				this.searchTimeout = setTimeout(_.bind(function() {
					if (searchQuery && searchQuery.length > 1 && searchQuery === model.get('yoimgSearchQuery')) {
						YOIMG_SEARCH_CURR_PAGE = -1;
						load(searchQuery, model);
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
					model : this.model
				}).render();
				this.views.set([ this.search, this.results ]);
			},
			dispose : function() {
				if (this._toolbar) {
					this._toolbar.options = _.clone(this._defaultToolbarOptions);
				}
				if (this.controller.views.get('.media-frame-toolbar') &&
					this.controller.views.get('.media-frame-toolbar').length == 1) {
					var toolbar = this.controller.views.get('.media-frame-toolbar')[0];
					if (toolbar && toolbar.$el) {
						toolbar.$el.removeClass('yoimgSearchActive');
					}
					if (toolbar.get('yoimgInsert')) {
						toolbar.unset('yoimgInsert');
					}
				}
				this.model.set('yoimgSearchActive', false);
				return wp.media.View.prototype.dispose.apply(this, arguments);
			},
			render : function() {
				var mediaFrameToolbar = this.controller.views.get('.media-frame-toolbar');
				if (mediaFrameToolbar && mediaFrameToolbar.length === 1) {
					this._toolbar = mediaFrameToolbar[0];
					this._defaultToolbarOptions = _.clone(this._toolbar.options);
					if (this._toolbar && this._toolbar.$el) {
						this._toolbar.$el.addClass('yoimgSearchActive');
					}
					this._toolbar.set( 'yoimgInsert', new wp.media.view.Button.YoimgSearchButton({
						state: this.controller.state()
					}));
				}
				this.model.set('yoimgSearchActive', true);
				return wp.media.View.prototype.render.apply(this, arguments);
			}
		});
		wp.media.view.Button.YoimgSearchButton = wp.media.view.Button.extend({
			events: {
				'click': 'click'
			},
			defaults: {
				style: 'primary',
				text: l10n.uploadImageButton,
				size: 'large',
				disabled: true
			},
			initialize: function(options) {
				wp.media.view.Button.prototype.initialize.call(this);
				var state = options.state;
				state.on('change:yoimgSearchActive', this.refresh, this);
				state.on('change:yoimgSearchImages', this.refresh, this);
				state.on('change:yoimgSearchSelecting', this.refresh, this);
			},
			refresh: function() {
				var state = this.controller.state();
				var yoimgSearchActive = state.get('yoimgSearchActive') === true;
				if (yoimgSearchActive) {
					var selectedImages = state.get('yoimgSearchImages');
					var selectingImages = state.get('yoimgSearchSelecting');
					var active = selectedImages && selectedImages.length && !selectingImages;
					this.$el.attr('disabled', !active);
				}
			},
			click: function(event) {
				event.preventDefault();
				this.controller.trigger('yoimg-search-select');
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
			}
		});

		var argsYoimgSearch = {
			yoimgSearchSelectCb : function(res) {
				var state = this.state();
				if (res && res.length && state) {
					var attachments = [];
					var selection = state.get('selection');
					if (state.id !== 'featured-image') {
						state.get('library').observe( selection );
					}
					for (var i = 0; i < res.length; i++) {
						var resItem = res[i];
						var id = resItem.imageId;
						if ( '' !== id && -1 !== id ) {
							var attachment = wp.media.model.Attachment.get( id );
							attachment.fetch();
							attachments.push(attachment);
						}
					}
					selection.reset( attachments );
				}
				this.content.mode('browse');
			},
			yoimgSearchSelectCompleteCb : function() {
				var model = this.state();
				model.set('yoimgSearchImages', []);
				model.set('yoimgSearchSelecting', false);
				this.content.view.$el.find('.yoimages-search-spinner').remove();
				this.content.view.$el.find('.media-frame-toolbar .media-toolbar-primary.search-form').removeClass('yoimg-media-toolbar');
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
					this.content.view.$el.find('.media-frame-toolbar .media-toolbar-primary.search-form').addClass('yoimg-media-toolbar').prepend('<span class="spinner is-active yoimages-search-spinner"></span>');
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
		};

		var argsSelectWithYoimgSearch = {
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
			yoimgSearch : function() {
				this.$el.removeClass('hide-toolbar');
				this.content.set(new wp.media.view.YoimgSearch({
					controller : this,
					model : this.state()
				}));
			},
			createSelectToolbar : function(toolbar, options) {
				options = options || this.options.button || {};
				options.controller = this;
				toolbar.view = new wp.media.view.Toolbar.SelectWithYoimgSearch(options);
			}
		};
		jQuery.extend(argsSelectWithYoimgSearch, argsYoimgSearch);

		var argsPostWithYoimgSearch = {
			bindHandlers : function() {
				this.on('content:render:yosearch', this.yoimgSearch, this);
				this.on('yoimg-search-select', this.yoimgSearchSelect, this);
				wp.media.view.MediaFrame.Post.prototype.bindHandlers.call(this);
			},
			browseRouter : function(routerView) {
				wp.media.view.MediaFrame.Post.prototype.browseRouter.call(this, routerView);
				if (this.state() && this.state().id && _.contains(YOIMG_SEARCH_STATES, this.state().id)) {
					routerView.set({
						yosearch : {
							text : l10n.searchImagesTitle,
							priority : 60
						}
					});
				}
			},
			yoimgSearch : function() {
				if (_.contains(YOIMG_SEARCH_STATES, this.state().id)) {
					this.content.set(new wp.media.view.YoimgSearch({
						controller : this,
						model : this.state()
					}));
				} else {
					this.content.mode('browse');
				}
			},
			mainInsertToolbar: function(view) {
				wp.media.view.MediaFrame.Post.prototype.mainInsertToolbar.call(this, view);
			}
		};
		jQuery.extend(argsPostWithYoimgSearch, argsYoimgSearch);

		wp.media.view.MediaFrame.SelectWithYoimgSearch = wp.media.view.MediaFrame.Select.extend(argsSelectWithYoimgSearch);
		wp.media.view.MediaFrame.PostWithYoimgSearch = wp.media.view.MediaFrame.Post.extend(argsPostWithYoimgSearch);
		var mediaWithYoimgSearch = function(attributes) {
			var originalAttrs = _.clone(attributes);
			originalAttrs = _.defaults(originalAttrs || {}, {
				frame : 'select'
			});
			var frame = window.originalWpMedia(attributes);
			if ('select' === originalAttrs.frame && wp.media.view.MediaFrame.SelectWithYoimgSearch) {
				attributes = originalAttrs;
				frame = new wp.media.view.MediaFrame.SelectWithYoimgSearch(attributes);
			} else if ('post' === originalAttrs.frame) {
				attributes = originalAttrs;
				frame = new wp.media.view.MediaFrame.PostWithYoimgSearch(attributes);
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