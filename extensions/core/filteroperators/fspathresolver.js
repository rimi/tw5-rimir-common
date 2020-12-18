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
exports.fspathresolver = function(source,operator,options) {
	var template = operator.operand;
	var results = [];
	source(function(tiddler,title) {
		if(tiddler && tiddler.fields.tags){
			tiddler.fields.tags.forEach(function(tag, index, array){
				const tagTiddler = options.wiki.getTiddler(tag);
				if(tagTiddler && tagTiddler.hasField("tmpl.fs-path")){
					results.push(formatTemplate(tagTiddler.fields["tmpl.fs-path"], tiddler.fields));
				}
			});
		}
	});
	return results;
};
	
// UTILS BEGIN

const formatTemplate = function(templateString, templateVars){
  return new Function("return `"+templateString +"`;").call(templateVars);
}

})();
