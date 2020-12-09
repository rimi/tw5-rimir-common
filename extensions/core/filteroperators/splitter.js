/*\
title: $:/plugins/rimir/core-hooks/filteroperators/splitter
type: application/javascript
module-type: filteroperator

Filter operator that handles all input strings as title-lists and splits them into parts.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Export our filter function
*/
exports.splitter = function(source,operator,options) {
	var results = [];
	source(function(tiddler,title) {
		var list = $tw.utils.parseStringArray(title);
		list.forEach(function(value, index, array){
			results.push(value);
		});
	});
	return results;
};

})();
