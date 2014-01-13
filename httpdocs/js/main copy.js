"use strict";
(function($)
{
	var mainQueue = PQUEUE(null, [
		function initialize(q)
		{
			q.heap.apis = {
				'shiftFrame' :
					function (index, callback)
					{
						q.heap.authorizationWindow.frames[0].animate({
							marginLeft: '-' + (Number(index) * 100) + '%'
						}, 300, callback);
					},
				'trySignIn' :
					function ()
					{
						var signInQueue = PQUEUE(q, [
							function checkLock(q)
							{
								if (q.parent.heap.signInForm._locked) {
									q.pc.goto(q.pc.locate('PQUEUE_HALT'));
								} else {
									q.parent.heap.signInForm.content.usernameField.attr('disabled', 'disabled');
									q.parent.heap.signInForm.content.passwordField.attr('disabled', 'disabled');
									q.parent.heap.signInForm.navigation.signInButton.attr('disabled', 'disabled');
									q.parent.heap.signInForm._locked = true;
								}
							},
							function shiftView(q)
							{
								q.wait();
								q.parent.heap.api('shiftFrame')(1, q.walk);
							},
							function initializeStatusView(q)
							{
								q.wait();
								q.parent.heap.signInStatus.navigation.backButton.attr('disabled', false);
							},
							function fireRequest(q)
							{
								q.wait();
								$.ajax('system.php', {
									type: 'POST',
									url: 'system.php',
									timeout: 7000,
									async: true,
									dataType: 'json',
									statusCode: {
										404: function ()
										{
											
										},
										500: function ()
										{
											
										}
									},
									data: { userAuthentication: 'yes', username: q.heap.signInForm.content.usernameField.val(), password: q.heap.signInForm.content.passwordField.val() }
								}).then(function (data, textStatus, jqXHR)
								{
									q.heap.signInStatus.text('success');
									if (data.passed) {
										q.heap.signInStatus.text('passed');
									} else {
										q.heap.signInStatus.text(data.errMsg);
									}
								}, function (jqXHR, textStatus, errorThrown)
								{
									switch (textStatus) {
										case 'timeout':
											
											break;
										case 'error':
											alert(errorThrown);
											break;
										case 'abort':
											break;
										case 'parsererror':
											break;
										default:
											alert('unknown error');
									}
								});
							},
							PQUEUE_HALT
						], 0).tick();
						return false;
					}
			};
			q.heap.api = function (apiName)
			{
				if (typeof q.heap.apis[apiName] !== 'undefined') {
					return q.heap.apis[apiName];
				} else {
					try {
						console.warn('API[' + apiName + '] not found.');
					} catch (e) {}
					return function () {};
				}
			};
			
			q.heap.body = $(document.body);
			q.heap.mainFrame = $('<div id="mainFrame">').hide().appendTo(q.heap.body);
		},
		function askUserToSignIn(q)
		{
			q.wait();
			q.heap.authorizationWindow = document.createWindow({
				id: 'authorizationWindow',
				withNavigation: true,
			});
			q.heap.authorizationWindow.hide().appendTo(q.heap.body);
			
			q.heap.signInForm = q.heap.authorizationWindow.createFrame({
				id: 'signInForm',
				isForm: true,
				title: 'authentication'
			});
			q.heap.signInForm._locked = true; // lock flag
			q.heap.signInForm.navigation.signUpButton = $('<button class="signUpButton leftside" type="button" disabled="disabled" title="not available" tabIndex="3">sign up</button>').appendTo(q.heap.signInForm.navigation);
			q.heap.signInForm.navigation.signInButton = $('<button class="signInButton rightside" type="submit" disabled="disabled" tabIndex="4">sign in</button>').appendTo(q.heap.signInForm.navigation);

			q.heap.signInForm.content.usernameFrame = $('<div class="usernameFrame">').appendTo(q.heap.signInForm.content);
			q.heap.signInForm.content.usernameLabel = $('<label class="usernameLabel" for="usernameField">username</label>').appendTo(q.heap.signInForm.content.usernameFrame);
			q.heap.signInForm.content.usernameField = $('<input id="usernameField" class="usernameField borderless centerAligned" type="text" disabled="disabled" tabIndex="1" autocomplete="off">').appendTo(q.heap.signInForm.content.usernameFrame);
			
			q.heap.signInForm.content.passwordFrame = $('<div class="passwordFrame">').appendTo(q.heap.signInForm.content);
			q.heap.signInForm.content.passwordLabel = $('<label class="passwordLabel" for="passwordField">password</label>').appendTo(q.heap.signInForm.content.passwordFrame);
			q.heap.signInForm.content.passwordField = $('<input id="passwordField" class="passwordField borderless centerAligned" type="password" disabled="disabled" tabIndex="2" autocomplete="off">').appendTo(q.heap.signInForm.content.passwordFrame);
			
			q.heap.signInStatus = q.heap.authorizationWindow.createFrame({
				id: 'signInStatus',
				isForm: false
			});
			q.heap.signInStatus.navigation.backButton = $('<button class="backButton leftside" type="button" disabled="disabled">authentication</button>')
			.click(function ()
			{
				q.heap.api('shiftFrame')(0, false);
			})
			.appendTo(q.heap.signInStatus.navigation);
			q.heap.signInStatus.navigation.completeButton = $('<button class="completeButton rightside" type="submit" disabled="disabled">complete</button>').appendTo(q.heap.signInStatus.navigation);
			q.heap.signInStatus.content
			/*
				q.heap.signInStatusLabel.autoCenter = function ()
				{
					this.css({
						position: 'absolute',
						top: '50%',
						left: '50%',
						marginTop: '-' + (this.height() / 2) + 'px',
						marginLeft: '-' + (this.width() / 2) + 'px'
					});
				};
				q.heap.signInStatus.text = function (content)
				{
					q.heap.signInStatusLabel.text(content);
					q.heap.signInStatusLabel.autoCenter();
				};
			*/
			q.heap.signInForm.unlock = function ()
			{
				if (!q.heap.signInForm._locked)
					return false;
				q.heap.signInForm.content.usernameField.attr('disabled', false);
				q.heap.signInForm.content.passwordField.attr('disabled', false);
				q.heap.signInForm.navigation.signInButton.attr('disabled', false);
				q.heap.signInForm._locked = false;
				return true;
			};
			q.heap.signInForm.submit(q.heap.api('trySignIn'));
			
			q.heap.authorizationWindow.fadeIn(300, q.walk);
		},
		function focusOnSignInForm(q)
		{
			q.heap.signInForm.unlock();
			q.heap.signInForm.content.usernameField.focus();
		},
		PQUEUE_HALT
	], 0).tick();
})(jQuery);