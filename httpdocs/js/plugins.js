"use strict";
function VOID(){}

// set race module
function SETRACE(a,b,c){return"object"!=typeof a||"function"!=typeof b?null:new function(){function j(){0>=g&&h.call()}function k(a){return function(){if(e[a]===!1&&(e[a]=!0,--g,null!==i)){var b=1-g/f;i.call(this,b)}j()}}(new Date).getTime();var e=[],f=0,g=0,h=b,i="function"!=typeof c?null:c;this.set=[];for(var l=0;l<a.length;++l){var m=a[l];"undefined"!=typeof m&&"undefined"==typeof e[m]&&(e[m]=!1,this.set[m]=k(m),++g)}f=g}}

/**
 * API framework
 *
 * this framework offers an easy way to store and fetch functions
 */

function APISET() {
    var t_f = 'function',
        t_u = 'undefined',
        functionSet = [],
        overwrite = false;
    var result = function (functionName) {
        if (typeof functionSet[functionName] !== t_f) {
            throw 'APISET Exception: Function not found.';
            return function () {};
        } else {
            return functionSet[functionName];
        }
    };
    result.enableOverwrite = function () {
        overwrite = true;
    };
    result.disableOverwrite = function () {
        overwrite = false;
    };
    function _registerOneFunction(functionObject) {
        if (typeof functionObject !== t_f) {
            throw 'APISET Exception: Invalid type [' + (typeof functionObject) + '] for registration. Expected [' + t_f + '].';
            return;
        }
        var functionName = functionObject.name;
        if (functionName === '') {
            throw 'APISET Exception: Invalid function property:name. Function name should not be empty.';
            return;
        }
        if (typeof functionSet[functionName] === t_f && overwrite !== true) {
            throw 'APISET Exception: Function name dulplication. Use force overwriting if is intended.';
            return;
        }
        functionSet[functionName] = functionObject;
    }
    result.register = function () {
        for (var i = 0; i < arguments.length; ++i) {
            _registerOneFunction(arguments[i]);
        }
    };
    result.find = function (functionName) {
        return (typeof functionSet[functionName] !== t_f) ? null : functionSet[functionName];
    };
    return result;
}

// window generator
function clipFrame (properties) {
	var frameObject = $('<div class="clipDecor">');
	var returnObject = $(frameObject);
	if (typeof properties.attr === 'object')
		frameObject.attr(properties.attr);
	var handleObject = $('<div class="handle"></div>');
	var titleObject = $('<label class="title">');
	var innerFrameObject = $('<div class="innerFrame">');
	var actionPanel = $('<div class="actionPanel">');
	var actionPanelWrapper = $('<div class="wrapper">').appendTo(actionPanel);
	var trigger = $('<div class="trigger"></div>');
	
	// <<< positioning
	var fixPoint = {
		x: 0.5,
		y: 0.5,
		top: '50%',
		left: '50%'
	};
	function getMarginTop(height) {
		return 0 - height * fixPoint.y;
	}
	function getMarginLeft(width) {
		return 0 - width * fixPoint.x;
	}
	function fixPositioning() {
		frameObject.css({
			position: 'absolute',
			top: fixPoint.top,
			left: fixPoint.left
		});
		return this;
	};
	if (typeof properties.fixPoint === 'object') {
		if (typeof properties.fixPoint.x === 'number') fixPoint.x = properties.fixPoint.x;
		if (typeof properties.fixPoint.y === 'number') fixPoint.y = properties.fixPoint.y;
		if (typeof properties.fixPoint.top === 'string') fixPoint.top = properties.fixPoint.top;
		if (typeof properties.fixPoint.left === 'string') fixPoint.left = properties.fixPoint.left;
	}
	// >>> positioning
	
	
	var minWidth = 30;
	var minHeight = 30;
	var padding = {h: 10, v: 10};
	var cargo = null;
	
	// <<< title
	
	function showTitle(duration) {
		if (!frameObject.hasClass('showTitle')) {
			if (typeof duration !== 'number') duration = 0;
			frameObject.addClass('showTitle', duration);
		}
		return this;
	};
	function hideTitle(duration) {
		if (frameObject.hasClass('showTitle')) {
			if (typeof duration !== 'number') duration = 0;
			frameObject.removeClass('showTitle', duration);
		}
		return this;
	};
	function setTitle(title) {
		if (typeof title !== 'string') title = '';
		titleObject.text(title);
		return this;
	};
	function getTitle() {
		return titleObject.text();
	};
	if (typeof properties.title === 'string') {
		setTitle(properties.title);
	}
	if (typeof properties.showTitle === 'boolean' && properties.showTitle === true) {
		showTitle(0);
	}
	// >>> title
	
	var miniCargo = $('<div>')
		.css({
			position: 'absolute',
			width: '1px',
			height: '1px',
			overflow: 'hidden',
			visibility: 'hidden',
			pointerEvents: 'none'
		});
	// processes
	function hideActions(queue, heap) {
		if (actionPanelWrapper.children().length === 0) {
			queue.pc.goto(queue.pc.locate('detachCargo'));
		} else {
			queue.pause();
			actionPanel
				.stop(true)
				.animate({
					height: '0',
					opacity: 0
				}, heap.duration2, queue.resume);
		}
	}
	function removeActions() {
		if (cargo !== null) {
			var actionContainer = cargo.children('.actions');
			if (actionContainer.length > 0) {
				actionContainer.append(actionPanelWrapper.children().detach());
			}
		} else {
			actionPanelWrapper.empty();
		}
		// set both width and height to 0
		actionPanel.width(0).height(0);
	}
	function detachCargo() {
		if (cargo !== null) {
			cargo.detach();
			cargo = null;
		}
	}
	function attachNewCargo(queue, heap) {
		if (heap.$cargo === null) {
			queue.pc.goto(queue.pc.locate('doCallback'));
		} else {
			heap.$cargo.addClass('measuring');
			innerFrameObject.append(heap.$cargo);
			cargo = heap.$cargo;
		}
	}
	function updateTitle(queue, heap) {
		var title = cargo.attr('title');
		if (typeof title === 'string') {
			setTitle(title);
			showTitle();
		} else {
			setTitle();
			hideTitle();
		}
	}
	function measureSubject(queue, heap) {
		// get readings
		heap.currBoxWidth = heap.$cargo.outerWidth();
		heap.currBoxHeight = heap.$cargo.outerHeight();
		heap.currWidth = heap.$cargo.width();
		heap.currHeight = heap.$cargo.height();
	}
	function doTheMath(queue, heap) {
		// calculate ideal frame size
		var currBoxRatio = heap.currBoxWidth / heap.currBoxHeight,
			idealRatio = minWidth / minHeight;
		if (heap.currBoxWidth >= minWidth && heap.currBoxHeight >= minHeight) {
			heap.frameWidth = heap.currBoxWidth;
			heap.frameHeight = heap.currBoxHeight;
		} else if ((heap.currBoxWidth < minWidth || currBoxRatio < idealRatio) && heap.currBoxHeight >= minHeight) {
			heap.frameWidth = minWidth;
			heap.frameHeight = heap.frameWidth / currBoxRatio;
		} else if ((heap.currBoxWidth >= minWidth || currBoxRatio >= idealRatio) && heap.currBoxHeight < minHeight) {
			heap.frameHeight = minHeight;
			heap.frameWidth = heap.frameHeight * currBoxRatio;
		}
		
		heap.frameWidth += padding.h * 2;
		heap.frameHeight += padding.v * 2;
	}
	function transform(queue, heap) {
		queue.pause();
		fixPositioning();
		resizeFrameWithin(heap.frameWidth, heap.frameHeight, heap.duration1, queue.resume);
	}
	function showNewCargo(queue, heap) {
		queue.pause();
		// fit test object
		cargo
			.css({
				position: 'absolute',
				top: '50%',
				left: '50%',
				width: heap.currWidth + 'px',
				height: heap.currHeight + 'px',
				marginLeft: '-' + (heap.currBoxWidth / 2) + 'px',
				marginTop: '-' + (heap.currBoxHeight / 2) + 'px'
			})
			.removeClass('measuring')
			.hide()
			.stop(true)
			.fadeIn(heap.duration2, queue.resume);
	}
	function loadNewActions() {
		var actionContainer = cargo.children('.actions');
		if (actionContainer.length > 0) {
			actionPanelWrapper.append(actionContainer.children().detach());
		}
		// update frame width
		actionPanel.width(actionPanelWrapper.width());
	}
	function showNewActions(queue, heap) {
		queue.pause();
		actionPanel
			.stop(true)
			.animate({
				height: actionPanelWrapper.height() + 'px',
				opacity: 1
			}, heap.duration2, queue.resume);
	}
	function doCallback(queue, heap) {
		(heap.callback || function(){})();
	}
	// <<< transform
	function resizeFrame(newWidth, newHeight) {
		frameObject
			.stop(true)
			.css({
				marginLeft: getMarginLeft(newWidth) + 'px',
				marginTop: getMarginTop(newHeight) + 'px'
			});
		innerFrameObject
			.stop(true)
			.css({
				width: newWidth + 'px',
				height: newHeight + 'px'
			});
		return this;
	}
	
	function resizeFrameWithin(newWidth, newHeight, duration, callback) {
		if (typeof duration !== 'number') duration = 300;
		if (typeof callback !== 'function') callback = VOID;
		var race = SETRACE([
			'frame',
			'innerFrame'
		], callback);
		frameObject
			.stop(true)
			.animate({
				marginLeft: getMarginLeft(newWidth) + 'px',
				marginTop: getMarginTop(newHeight) + 'px'
			}, duration, race.set['frame']);
		innerFrameObject
			.stop(true)
			.animate({
				width: newWidth + 'px',
				height: newHeight + 'px'
			}, duration, race.set['innerFrame']);
		return this;
	}
	function resetFrame() {
		return collapseFrame(0);
	}
	function collapseFrame(duration, callback) {
		// removeActions is called before detachCargo so that actions could be restored back to the cargo
		removeActions();
		detachCargo();
		resizeFrameWithin(1, 1, duration, callback);
		return this;
	}
	function contain($item, duration1, duration2, callback) {
		if (arguments.length == 0) {
			$item = miniCargo;
			duration1 = duration2 = 300;
			callback = null;
		}
		if (arguments.length >= 1) {
			$item = arguments[0];
		}
		if (arguments.length >= 2) {
			callback = arguments[1];
		}
		if (arguments.length >= 3) {
			callback = arguments[2];
			duration1 = duration2 = arguments[1];
		}
		if (arguments.length >= 4) {
			callback = arguments[3];
			duration2 = arguments[2];
		}
		if ($item === null || typeof $item !== 'object')
			$item = miniCargo;
		var smallQueue = PQUEUE(null, [
			function filtArguments(queue, heap) {
				heap.$cargo = $item;
				// default for duration1
				if (typeof duration1 !== 'number')
					heap.duration1 = 300;
				else
					heap.duration1 = Number(duration1);
				// default for duration2
				if (typeof duration2 !== 'number')
					heap.duration2 = 300;
				else
					heap.duration2 = Number(duration2);
				// default for callback
				if (typeof callback === 'function')
					heap.callback = callback;
				else
					heap.callback = null;
			},
			hideActions,
			removeActions,
			function hideCargo(queue, heap) {
				if (cargo !== null) {
					queue.pause();
					cargo.fadeOut(heap.duration2, queue.resume);
				}
			},
			detachCargo,
			attachNewCargo,
			updateTitle,
			measureSubject,
			doTheMath,
			transform,
			showNewCargo,
			loadNewActions,
			showNewActions,
			doCallback,
			PQUEUE_HALT
		], 0, 'clipFrame#' + frameObject.attr('id')).boot();
		return this;
	};
	function swap($item, duration1, duration2, callback) {
		if (arguments.length == 0) {
			$item = miniCargo;
			duration1 = duration2 = 300;
			callback = null;
		}
		if (arguments.length >= 1) {
			if (typeof arguments[0] === 'function') {
				$item = miniCargo;
				callback = arguments[0];
			} else {
				$item = arguments[0];
			}
		}
		if (arguments.length >= 2) {
			$item = arguments[0];
			callback = arguments[1];
		}
		if (arguments.length >= 3) {
			callback = arguments[2];
			duration1 = duration2 = arguments[1];
		}
		if (arguments.length >= 4) {
			callback = arguments[3];
			duration2 = arguments[2];
		}
		if ($item === null || typeof $item !== 'object')
			$item = miniCargo;
		var smallQueue = PQUEUE(null, [
			function filtArguments(queue, heap) {
				heap.$cargo = $item;
				// default for duration1
				if (typeof duration1 !== 'number')
					heap.duration1 = 300;
				else
					heap.duration1 = Number(duration1);
				// default for duration2
				if (typeof duration2 !== 'number')
					heap.duration2 = 300;
				else
					heap.duration2 = Number(duration2);
				// default for callback
				if (typeof callback === 'function')
					heap.callback = callback;
				else
					heap.callback = null;
			},
			hideActions,
			removeActions,
			detachCargo,
			function collapse(queue, heap) {
				queue.pause();
				resizeFrameWithin(1, 1, heap.duration1, queue.resume);
			},
			attachNewCargo,
			updateTitle,
			measureSubject,
			doTheMath,
			transform,
			showNewCargo,
			loadNewActions,
			showNewActions,
			doCallback,
			PQUEUE_HALT
		], 0, 'clipFrame#' + frameObject.attr('id')).boot();
		return this;
	};
	if (typeof properties.transform === 'object') {
		if (typeof properties.transform.diraction !== 'undefined') {
			switch (properties.transform.diraction) {
				case 0:
				case 'horizontal':
					break;
				case 1:
				case 'vertical':
					break;
				case 2:
				case 'diagonal':
				default:
					break;
			}
		}
	}
	
	frameObject.append(handleObject, titleObject, innerFrameObject, actionPanel, trigger);
	return returnObject.extend({
		fix: fixPositioning,
		resize: resizeFrame,     // (newWidth, newHeight)
		reset: resetFrame,
		collapse: collapseFrame, // (duration, callback)
		contain: contain,        // ($item, duration1, duration2, callback)
		swap: swap,              // ($item, duration1, duration2, callback)
		getTitle: getTitle,
		setTitle: setTitle,      // (title)
		showTitle: showTitle,    // (duration)
		hideTitle: hideTitle     // (duration)
	});
}

function DOMList(properties) {
	var frameObject = $('<ul class="DOMList">');
	var returnObject = $(frameObject);
	if (typeof properties.attr === 'object')
		frameObject.attr(properties.attr);
	if (typeof properties.css === 'object')
		frameObject.css(properties.css);
	var internalReference = [];
	function removeAllItemsFromList(destroy) {
		internalReference.length = 0;
		if (destroy) {
			frameObject.children().remove();
		} else {
			frameObject.children().detach();
		}
		return this;
	}
	function removeItemAtIndex(index) {
		if (typeof index === 'number' && index < internalReference.length) {
			// do we need to remove anything?
		}
		return this;
	}
	function addItemToList($item) {
		if (typeof $item === 'object') {
			var newItemIndex = internalReference.length;
			var newItemFrame = $('<li>').appendTo(frameObject);
			newItemFrame.append($item);
			// save reference
			internalReference[newItemIndex] = newItemFrame;
		}
		return this;
	}
	function getItemCount() {
		return internalReference.length;
	}
	function getItemByIndex(index) {
		if (typeof index !== 'number') return; // return undefined
		return internalReference[index].children();
	}
	function getItemByID(id) {
		if (typeof id !== 'string') return; // return undefined
		return frameObject.find('li > #' + string);
		/* deprecated
		for (var i = 0, n = internalReference.length; i < n; ++i) {
			var item_i = internalReference[i];
			if (item_i.attr('id') === id) return item_i;
		}
		return;
		*/
	}
	function applyToAllItem(func) {
		for (var i = 0, n = internalReference.length; i < n; ++i) {
			var $item = internalReference[i].children();
			func.call($item, i, $item);
		}
	}
	return returnObject.extend({
		removeAll: removeAllItemsFromList,
		append: addItemToList,
		// warning: don't overwrite 'length' property or jQuery bugs out
		count: getItemCount,
		index: getItemByIndex,
		find: getItemByID,
		applyToAll: applyToAllItem
	});
}

// integrated control objects
document.createWindow = function (windowParam) {
	if (typeof windowParam === 'undefined')
		return null;
	var newWindow = $('<div' + (windowParam.id ? ' id="' + escape(windowParam.id) + '"' : '') + ' class="window' + (windowParam.withNavigation ? ' withNavigation' : '') + '">');
	newWindow.frames = [];
	newWindow.getFrameByID = function (id) {
		for (var i = 0; i < newWindow.frames.length; ++i) {
			if (newWindow.frames[i].attr('id') === id)
				return newWindow.frames[i];
		}
		return null;
	};
	newWindow.createFrame = function (frameParam) {
		var newFrame = $('<' + (frameParam.isForm ? 'form' : 'div') + (frameParam.id ? ' id="' + escape(frameParam.id) + '"' : '') + ' class="windowFrame">');
		if (windowParam.withNavigation) {
			newFrame.navigation = $('<div class="navigation">').appendTo(newFrame);
			newFrame.navigation.titleLabel = $('<label class="titleLabel">').appendTo(newFrame.navigation);
			newFrame.navigation.text = function (content) {
				if (content)
					newFrame.navigation.titleLabel.text(content);
				else
					return newFrame.navigation.titleLabel.text();
			};
			if (frameParam.title)
				newFrame.navigation.text(frameParam.title);
		}
		newFrame.content = $('<div class="content">').appendTo(newFrame);
		newWindow.frames.push(newFrame);
		newWindow.append(newFrame);
		return newFrame;
	};
	return newWindow;
};