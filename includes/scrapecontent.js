var scrapeContent = function(html) {
	var _scrapedarr = [];

	//console.log($('h1').parent().prev().find('img').attr('src'));

	var extractString = function(s) {
		return $.trim(s.substring(s.indexOf(':') + 2));
	};

	// cards - ignore other H1s
	$('h1').has('a').each(function(i, e) {
		
		var _scrapedobj = {};
		_scrapedobj.card = $(this).find('a').text();
		_scrapedobj.image = $(this).parent().prev().find('img').attr('src');

		var _parsestring = $(this).parent().html();
		var _h1regexp = /<h1\b[^>]*>(.*?)<\/h1>/gi;
		var _iregexp = /<i\b[^>]*>(.*?)<\/i>/gi;
		var _brregexp = /<br\s*[\/]?>/gi;
		var _bregexp = /<\/b\s*[\/]?>/gi;

		// removes h1 (already parsed), i (not useful, just flavor text), br and /b
		_parsestring = _parsestring.replace(_h1regexp, '').replace(_iregexp, '').replace(_brregexp, '').replace(_bregexp, '');

		var _parsearray = [];
		_parsestring = $.trim(_parsestring);
		_parsearray = _parsestring.split("<b>"); // converts in arrays splitting from the bold tag
		_parsearray.splice(0, 1); // cuts off first item in array (always empty)

		$.each(_parsearray, function(i, e) {
			// adds only the relevant fields to the object, as the description is way too unestructured to scrape all fields
			if (!e.indexOf('Type:')) { // card type
				_scrapedobj.cardtype = extractString(this);
			}
			if (!e.indexOf('Cost:')) { // cost (generic)
				_scrapedobj.cost = extractString(this);
			}
			if (!e.indexOf('Memory Units:')) { // memory units required (for runner hardware)
				_scrapedobj.memoryunits = extractString(this);
			}
			/*
			if (!e.indexOf('Faction:')) { // associated faction
				_scrapedobj.faction = extractString(this);
			}
			*/
			if (!e.indexOf('Strength:')) { // for ICE only
				_scrapedobj.strength = extractString(this);
			}
			if (!e.indexOf('Agenda Points:')) { // for agendas only
				_scrapedobj.agendapoints = extractString(this);
			}
			if (!e.indexOf('Set:')) { // current set (not cycle)
				_scrapedobj.set = extractString(this);
			}
			if (!e.indexOf('Number:')) { // the number of this card in this set
				_scrapedobj.number = extractString(this);
			}
		});
		/* debug
		for (var e in _scrapedobj) {
			console.log(e + ' ' + _scrapedobj[e]);
		}
		*/
		_scrapedarr.push(_scrapedobj); // adds each object to the array
		
	});
	return _scrapedarr;
};