/*\
title: $:/plugins/rimir/core-hooks/extensions/core/HookEventHandler/rename-refs-on-relink
type: application/javascript
module-type: startup

A startup module to rename *.ref[s] entries if tiddler is renamed.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "rimir-rename-refs";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.synchronous = true;
	
exports.startup = function() {
	let self = this;
	let logger = new $tw.utils.Logger("rimir:rename-refs-on-relink", {enable: false});
	$tw.hooks.addHook("th-saving-tiddler",function(newTiddler, oldTiddler) {
		logger.log("Handling 'th-saving-tiddler'-Event...");
		if(oldTiddler && newTiddler){
			let oldTitle = oldTiddler.fields["draft.of"];
			let newTitle = newTiddler.fields.title;
			if(oldTitle !== newTitle) {
				handleRename(oldTitle, newTitle, logger);
			}
		}
		logger.log("...Done");
		return newTiddler;
	});
	$tw.hooks.addHook("th-renaming-tiddler",function(newTiddler, oldTiddler) {
		logger.log("Handling 'th-renaming-tiddler'-Event...");
		if(oldTiddler && newTiddler){
			let oldTitle = oldTiddler.fields.title;
			let newTitle = newTiddler.fields.title;
			if(oldTitle !== newTitle) {
				handleRename(oldTitle, newTitle, logger);
			}
		}
		logger.log("...Done");
		return newTiddler;
	});
};
	
function handleRename(oldTitle, newTitle, logger){
	$tw.wiki.each(function(tiddler,title) {
		let changes = {};
		let isModified = false;
		for(let prop in tiddler.fields){
			if(prop.endsWith(".ref") || prop.endsWith(".refs")){
				var list = $tw.utils.parseStringArray(tiddler.fields[prop]);
				$tw.utils.each(list,function (title,index) {
					if(title === oldTitle) {
						logger.log("Renaming ref[s] in '" + prop + "' from '" + list[index] + "' to '" + newTitle + "' of tiddler '" + oldTitle + "'");
						list[index] = newTitle;
						isModified = true;
						changes[prop] = $tw.utils.stringifyList(list);
					}
				});
			}
		}
		if(isModified) {
			let myNewTiddler = new $tw.Tiddler(tiddler,changes,$tw.wiki.getModificationFields())
			//myNewTiddler = $tw.hooks.invokeHook("th-relinking-tiddler",myNewTiddler,tiddler);
			$tw.wiki.addTiddler(myNewTiddler);
		}
	});
}

})();
