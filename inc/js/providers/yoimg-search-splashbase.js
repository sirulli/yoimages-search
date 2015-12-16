(function() {
	var providerName = 'splashbase.co';
	YoimgSearch.registerProvider({
		invoke : function(searchQuery, deferred) {
			jQuery.ajax({
				dataType : 'json',
				url : 'http://www.splashbase.co/api/v1/images/search',
				data : {
					query : searchQuery
				},
				success : function(results) {
					if (!results) {
						results = {};
					}
					results.source = providerName;
					deferred.resolve(results);
				},
				error : function(jqXHR, textStatus, errorThrown) {
					var messageFromServer = jqXHR.responseText;
					deferred.reject({
						isError : true,
						source : providerName,
						textStatus : textStatus,
						errorThrown : errorThrown,
						messageFromServer : messageFromServer
					});
				}
			});
		}
	});
})();