"use strict";
(function($) {
	var mainQueue = PQUEUE(null, [
		function initialize(queue, heap) {
			if (!heap.initialize) { // run only once
				heap.initialize = true;
				//>>> define webSafe fonts
				heap.webSafeSansSerif = 'Verdana, Helvetica, Arial, sans-serif';
				heap.webSafeSerif = 'Georgia, "Times New Roman", Times, serif';
				heap.webSafeMonospace = '"Andale Mono", "Courier New"';
				//>>> template strings
				heap.str = {
					"check_submit" : String.fromCharCode(10003) + " submit",
					"check_ok" : String.fromCharCode(10003) + " ok",
					"check_confirm" : String.fromCharCode(10003) + " confirm",
					"cross_cancel" : String.fromCharCode(10007) + " cancel"
				};
				//>>> lock html element
				heap.html = $('html');
				//>>> lock body
				heap.body = $(document.body);
				//>>> initialize queue protected api structure
				heap.api = APISET();
				//>>> define common css properties
				heap.css = [];
				//>>> define global image stack
				heap.image = [];
				//>>> reference of window frames
				heap.view = [];
				//>>> define module stack
				heap.mod = [];
			}
			heap.html.stop(true).removeClass('withBgc withBgi');
		},
		function setup_notification(queue, heap) {
			if (!heap.setup_notification) { // run only once
				heap.setup_notification = true;
				//>>> setup notification container
				heap.notifications = $('<ul class="notificationStack">').appendTo(heap.body);
				//>>> initialize notification api
				heap.api.register(
					function note(msg, duration) {
						var newMsg = $('<li class="message">').css({
							width: '150px',
							marginLeft: '100%'
						}).text(msg);
						newMsg.active = true;
						newMsg.close = function () {
							if (newMsg.active) {
								newMsg.active = false;
								if (typeof newMsg.timer != 'undefined') {
									window.clearTimeout(newMsg.timer);
								}
								newMsg.animate({
									marginLeft: '100%'
								}, 300).animate({
									padding: '0',
									height: '0'
								}, 100, function () {
									newMsg.remove();
								});
							}
						};
						newMsg.click(newMsg.close);
						newMsg.appendTo(heap.notifications).animate({
							marginLeft: '0%'
						}, 300, function () {
							if (typeof duration === 'number' && duration > 0) {
								newMsg.timer = window.setTimeout(newMsg.close, duration);
							}
						});
						return newMsg;
					},
					function alert(msg) {
						var newMsg = $('<li class="message alert">').css({
							width: '150px',
							marginLeft: '100%'
						}).text(msg);
						newMsg.active = true;
						newMsg.close = function () {
							if (newMsg.active) {
								newMsg.active = false;
								if (typeof newMsg.timer != 'undefined') {
									window.clearTimeout(newMsg.timer);
								}
								newMsg.animate({
									marginLeft: '100%'
								}, 300).animate({
									padding: '0',
									height: '0'
								}, 100, function () {
									newMsg.remove();
								});
							}
						};
						newMsg.click(newMsg.close);
						newMsg.appendTo(heap.notifications).animate({
							marginLeft: '0%'
						}, 300);
						return newMsg;
					}
		        );
		    }
		},
		function setup_ui(queue, heap) {
			heap.mod['ui'] = new mod_ui(queue);
			queue.pause();
			heap.mod['ui'].takeOver(queue.resume);
		},
		function setup_server(queue, heap) {
			heap.mod['server'] = new mod_server(queue);
		},
		function setup_user(queue, heap) {
			heap.mod['user'] = new mod_user(queue);
			//queue.pause();
			heap.mod['user'].signIn(queue.resume);
		},
		PQUEUE_BARRIER,
		function analyzeSessionHash(queue, heap) {},
		function main_sequenceHead(queue, heap) {
			heap.api('note')('main_sequenceHead', 2300);
			heap.mod['main'] = {};
			heap.mod['main']['moduleList'] = DOMList({
				attr: {
					title: 'Modules'
				}
			});
			
			heap.mod['main']['moduleList'].disableAll = function () {
				heap.mod['main']['moduleList'].applyToAll(function (index, $item) {
					$item.prop('disabled', true);
				});
			};
			heap.mod['main']['moduleList'].enableAll = function () {
				heap.mod['main']['moduleList'].applyToAll(function (index, $item) {
					$item.prop('disabled', false);
				});
			};
			
			// profile module
			heap.mod['main']['moduleList']['profile'] = $('<button class="">').attr('title', 'Profiles').click(function () {
			
			});
			heap.mod['main']['moduleList'].append(heap.mod['main']['moduleList']['profile']);
			
			// account module
			heap.mod['main']['moduleList']['account'] = $('<button class="">').attr('title', 'Account').click(function () {
			
			});
			heap.mod['main']['moduleList'].append(heap.mod['main']['moduleList']['account']);
			
			// settings module
			heap.mod['main']['moduleList']['setting'] = $('<button class="">').attr('title', 'Settings').click(function () {
			
			});
			heap.mod['main']['moduleList'].append(heap.mod['main']['moduleList']['setting']);
			
			// sign out
			heap.mod['main']['moduleList']['signOutButton'] = $('<button class="">').attr('title', 'Sign Out').click(function () {
				var bt = heap.mod['main']['moduleList']['signOutButton'];
				if (bt.hasClass('selected')) return;
				bt.addClass('selected');
				heap.mod['user'].signOut(queue.resume);
			});
			heap.mod['main']['moduleList'].append(heap.mod['main']['moduleList']['signOutButton']);
		},
		function main_showSideBar(queue, heap) {
			queue.pause();
			heap.mod['ui'].sideBar.fadeIn(300, queue.resume);
		},
		function main_loadModuleList(queue, heap) {
			heap.mod['main']['moduleList'].enableAll();
			heap.mod['ui'].sideBar.contain(heap.mod['main']['moduleList']);
		},
		function idle(queue, heap) {
			queue.pause();
			queue.pc.offset(-1);
		},
		PQUEUE_HALT
	], 0, 'main').boot();
})(jQuery);