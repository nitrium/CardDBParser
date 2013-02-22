var base_categories = [];
var parsed_categories = [];
var STORAGE_DIR = 'download/';
var IMG_DIR = 'cards/'
var DEFAULT_BASE_URL = 'http://www.cardgamedb.com';
var t = Date.now();

var casper = require('casper').create({
    clientScripts:  [
        'includes/jquery-1.9.1.min.js',
        'includes/findheadlinks.js',
        'includes/scrapecontent.js'
    ],
    verbose: true,
    logLevel: "info"
});

var iterateThruPages = function(_array) {
	casper.each(_array, function(_self, _link) {
		_self.thenOpen(_link, function() {
			// if true, this page has content to be scrapped off (i.e. cards, with or without pagination)
			// also, makes sure the page has any content, because cardgamedb.com sometimes create empty collections with pagination, but no content
			if (this.exists('.ipsBox_container') && !(this.exists('.no_messages'))) {
				
				var _concat_array = [];
				var iterateThruPagination = function(cspobj) {
					var _data_array = [];
					_data_array = cspobj.evaluate(function(e) {
						return scrapeContent(e);
					}, cspobj.getHTML());
					_concat_array = _concat_array.concat(_data_array);
					
					// checks if there's pagination on this page
					if (cspobj.exists('li.next')) {
						cspobj.then(function() {
							this.click('li.next > a');
						});
						cspobj.then(function() {
							this.test.info('current location: ' + this.getCurrentUrl());
							iterateThruPagination(this);
						});
					} else { // ended pagination, object is complete, save to disk
						// save each image to a file
						casper.each(_concat_array, function(_self, _i) {
							_image_name = DEFAULT_BASE_URL + _i.image.replace(/\.jpg\s*?/gi, '.png').replace(/tn_\s*?/gi, 'ffg_');
							this.download(_image_name, STORAGE_DIR + IMG_DIR + _image_name.substr(_image_name.indexOf('ffg_'))); // downloads image with the same name as original
							this.echo('[downloaded: ' + STORAGE_DIR + IMG_DIR + _image_name.substr(_image_name.indexOf('ffg_')) + ']');
						});

						var _fs = require('fs');
						var _file_name = (cspobj.getHTML('.ipsType_pagetitle')).replace(/ /g, '-').toLowerCase() + '.json';
						_fs.write(STORAGE_DIR + _file_name, JSON.stringify(_concat_array), 'w');
						cspobj.echo('[saved: ' + STORAGE_DIR + _file_name + ']');
					}
					cspobj.test.info('#####################################################################');
				};

				iterateThruPagination(this); // loop through pagination/single pages to scrape content

				// stores scraped URLs for log control purposes
				parsed_categories.push(_link);

			} else { // hasn't found content, go through the page again
				var _new_links_holder = [];
				_new_links_holder = this.evaluate(function(e) {
					return findHeadLinks(e);
				}, this.getHTML());
				iterateThruPages(_new_links_holder);
			}
		});
	});
};

// first pass on URL, checking for base content
// casper.start('samples/index.html', function() { // DEBUG
casper.start('http://www.cardgamedb.com/index.php/netrunner/android-netrunner-card-spoilers/', function() {
	this.echo("[loaded in " + (Date.now() - t)/1000 + " seconds]");
	base_categories = this.evaluate(function(e) {
		return findHeadLinks(e);
	}, this.getHTML());
	// base_categories = ['samples/core_1.html', 'samples/genesis.html']; // DEBUG
});

// goes over each URL found in first pass to find for internal URLs with content
casper.then(function() {
	iterateThruPages(base_categories);
});

casper.run(function() {
	this.echo('[all done, no errors]');
	this.echo('[parsed urls: ' + parsed_categories + ']').exit();
});