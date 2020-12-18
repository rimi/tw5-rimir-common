/*\

Filter operator that applies the given template on all incoming tiddlers.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Export our filter function
*/
exports.applytempl = function(source,operator,options) {
	var template = operator.operand;
	var results = [];
	source(function(tiddler,title) {
		if(tiddler){
			results.push(formatTemplate(template, tiddler.fields));
		}
	});
	return results;
};
	
// UTILS BEGIN

const formatTemplate = function(templateString, templateVars){
  return new Function("return `"+templateString +"`;").call(templateVars);
}

})();
