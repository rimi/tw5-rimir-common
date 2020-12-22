/*\
With special thanks to fibbles: https://github.com/flibbles/tw5-relink/issues/26 !

Handles all fields with ".ref" and ".refs" suffixes.

\*/

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var settings = require('$:/plugins/flibbles/relink/js/settings.js');
var EntryNode = require('$:/plugins/flibbles/relink/js/utils/entry');

var FieldEntry = EntryNode.newType("refField");

FieldEntry.prototype.report = function() {
	return [this.field];
};

exports['refFields'] = function(tiddler, fromTitle, toTitle, changes, options) {
	$tw.utils.each(tiddler.fields, function(value, field) {
		var handler
		if (field.endsWith(".ref")) {
			handler = settings.getType("title");
		} else if (field.endsWith(".refs")) {
			handler = settings.getType("list");
		}
		if (handler) {
			var entry = handler.relink(value, fromTitle, toTitle, options);
			if (entry) {
				var fieldEntry = new FieldEntry();
				// Setting field allows this entry to report properly in //Relink// references tab.
				fieldEntry.field = field;
				// Setting output allows the change to bubble up if this entry is somehow nested.
				fieldEntry.output = entry.output;
				// Needed, in case the relink was impossible. This allows it to report that.
				fieldEntry.add(entry);
				changes[field] = fieldEntry;
			}
		}
	});
};
