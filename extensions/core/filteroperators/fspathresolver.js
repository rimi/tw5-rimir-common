/*\

Filter operator that applies the given template on all incoming tiddlers.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

const FIELDNAME_CONTAINMENT_FIELDS = "fs-path.containment.fields";
const FIELDNAME_CONTAINMENT_TEMPLATE = "fs-path.containment.tmpl";
const FIELDNAME_TEMPLATE = "fs-path.tmpl";
const FIELDNAME_FSPATH_PREFIX = "fs-path.";
	
const logger = new $tw.utils.Logger("fspathresolver", {enable: true});
	
/*
Export our filter function
*/
exports.fspathresolver = function(source,operator,options) {
	var template = operator.operand;
	var results = [];
	source(function(tiddler,title) {
		const path = calculateFsPathForTiddler(tiddler, options);
		if(path){
			logger.log("Calculated File-PATH for '" + title + "': " + path);
			results.push(path);
		}
	});
	return results;
};

const calculateFsPathForTiddler = function(tiddler, options){
	let result;
	const fsPathDefiningTagTiddler = findFsPathDefiningTagTiddler(tiddler, options);
	if(fsPathDefiningTagTiddler){
		logger.log("Tiddler '" + tiddler.fields.title + "' has fs-path definition inside of '" + fsPathDefiningTagTiddler.fields.title + "'");
		if(definesFsPathContainment(fsPathDefiningTagTiddler)){
			logger.log(" -> AS CONTAINMENT");
			result = calculateContainmentPath(tiddler, fsPathDefiningTagTiddler, options);
		}else if(definesFsPathTemplate(fsPathDefiningTagTiddler)){
			logger.log(" -> AS TEMPLATE");
			result = calculateTemplatePath(tiddler, fsPathDefiningTagTiddler, options)
		}else{
			logger.alert("Unknown fs-path definition located inside of '" + fsPathDefiningTagTiddler.fields.title + "'!");
		}
	}
	return result;
}
	
/*

*/
const calculateContainmentPath = function(tiddler, fsContainmentPathDefiningTiddler, options){
	let result;
	const fieldsList = $tw.utils.parseStringArray(fsContainmentPathDefiningTiddler.fields[FIELDNAME_CONTAINMENT_FIELDS]);
	for (let field of fieldsList){
		if(tiddler.hasField(field)){
			const containerTiddler = options.wiki.getTiddler(tiddler.fields[field]);
			if(containerTiddler){
				const containerPath = calculateFsPathForTiddler(containerTiddler, options);
				const containerPathTmpl = fsContainmentPathDefiningTiddler.fields[FIELDNAME_CONTAINMENT_TEMPLATE];
				if(containerPathTmpl && containerPathTmpl.length > 0){
					let values = {};
					for(let prop in tiddler.fields){
						values[prop] = tiddler.fields[prop];
						values["parentFsPath"] = containerPath;
					}
					result = formatTemplate(containerPathTmpl, values);
				}else{
					result = containerPath + "/" + tiddler.fields.title;
				}
				break;
			}
		}
	};
	return result;
}
 
/*

*/
const definesFsPathContainment = function(tiddler){
	return tiddler && tiddler.hasField(FIELDNAME_CONTAINMENT_FIELDS);
}

/*

*/
const definesFsPathTemplate = function(tiddler){
	return tiddler && tiddler.hasField(FIELDNAME_TEMPLATE);
}

/*
Searches for any tag assigned to the tiddler that defines something about fs-path
*/
const findFsPathDefiningTagTiddler = function(tiddler, options){
	let result;
	if(tiddler.fields.tags){
		for (let tag of tiddler.fields.tags){
			const tagTiddler = options.wiki.getTiddler(tag);
			for(let field in tagTiddler.fields){
				if(field.startsWith(FIELDNAME_FSPATH_PREFIX)){
					result = tagTiddler;
					break;
				}
			}
			if(result){
				break;
			}
		};
	}
	return result;
}

	
const calculateTemplatePath = function(tiddler, fsPathDefiningTagTiddler, options){
	return formatTemplate(fsPathDefiningTagTiddler.fields[FIELDNAME_TEMPLATE], tiddler.fields);
}

// UTILS BEGIN

const formatTemplate = function(templateString, templateVars){
  return new Function("return `"+templateString +"`;").call(templateVars);
}

})();
