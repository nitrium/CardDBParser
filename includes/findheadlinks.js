var findHeadLinks = function(h) {
	var __collection = [];
	$('h4').each(function(i) {
		__collection.push($(this).find('a').attr('href'));
	});
	return __collection;
}