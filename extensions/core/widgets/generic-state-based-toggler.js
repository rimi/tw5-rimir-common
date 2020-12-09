/*\
title: $:/plugins/rimir/core-hooks/modules/widgets/generic-state-based-toggler
type: application/javascript
module-type: widget

Base-Widget that is able to do reveal based on a state-tiddler (on|off)

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var RimirTogglerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
RimirTogglerWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
RimirTogglerWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	var domNode = this.document.createElement(this.revealTag);
	var classes = this["class"].split(" ") || [];
	//classes.push("tc-reveal");
	domNode.className = classes.join(" ");
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	if(!this.isOpen) {
		if("visibility" === this.hideType) {
			domNode.setAttribute("style","visibility: hidden;");
		}else{
			domNode.setAttribute("hidden","true"); //sets "display: none;"
		}
	}
	this.domNodes.push(domNode);
};

/*
Compute the internal state of the widget
*/
RimirTogglerWidget.prototype.execute = function() {
	// Get our parameters
	this.revealTag = this.getAttribute("tag", "div");
	this["class"] = this.getAttribute("class","");
	this.hideType = this.getAttribute("hideType","display");
	// Compute the title of the state tiddler and read it
	this.readState();
	// Construct the child widgets
	var childNodes = this.isOpen ? this.parseTreeNode.children : [];
	this.hasChildNodes = this.isOpen;
	this.makeChildWidgets(childNodes);
};

/*
Read the state tiddler
*/
RimirTogglerWidget.prototype.readState = function() {
	// Read the information from the state tiddler
	var stateTitleTiddler = this.wiki.getTiddler(this.state);
	if(!stateTitleTiddler){
		this.isOpen = false;
	}else{
		if("on" == stateTitleTiddler.fields.text){
			this.isOpen = true;
		}else{
			this.isOpen = false;
		}
	}
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
RimirTogglerWidget.prototype.refresh = function(changedTiddlers) {
	var currentlyOpen = this.isOpen;
	this.readState();
	if(this.isOpen !== currentlyOpen) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

exports.rimir_toggler = RimirTogglerWidget;

})();
