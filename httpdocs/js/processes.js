var mod_server = function (parent_queue) {
	var self = this;
	if (typeof self.core === 'undefined') {
		// initialization
		self.core = {};
		self.api = {
			talk: function (data, callback_done, callback_error) {
				$.ajax('system.php', {
					type: 'GET',
					url: 'system.php',
					timeout: 7000,
					async: true,
					dataType: 'json',
					statusCode: {
						404: function () {
							parent_queue.heap.api('alert')('404');
						},
						500: function () {
							parent_queue.heap.api('alert')('500');
						}
					},
					data: data
				}).then(callback_done, callback_error);
			}
		};
	}
	return self.api;
};

var mod_ui = function (parent_queue) {
	var self = this;
	if (typeof self.core === 'undefined') {
		// initialization
		self.busy = false;
		self.core = {
			frame: {
				'dialogWindow': clipFrame({
					showTitle: false,
					title: 'SYSTEM DIALOG',
					attr: {
						id: 'systemDialog'
					},
					fixPoint: {
						x: 0.5,
						y: 0.5,
						top: '50%',
						left: '50%'
					}
				}),
				'sideBar': clipFrame({
					showTitle: true,
					title: 'SIDEBAR',
					transform: {
						diraction: 'horizontal',
						duration: 300
					},
					attr: {
						id: 'sideBar'
					},
					fixPoint: {
						x: 0,
						y: 0,
						top: '30px',
						left: '30px'
					}
				})
			},
			view: {
				'opening': $('<label class="singleLineNote font_mono nowrap">').text('DATABASE MANAGER')
			},
			resource: {},
			sequence: PQUEUE(null, [
				function setup(queue, heap) {
					self.core.frame['dialogWindow'].collapse().hide();
					self.core.frame['sideBar'].collapse().hide();
				},
				function loadBackgroundImg(queue, heap) {
					if (typeof self.core.resource['globalBgImg'] === 'undefined') { // run only once
						queue.pause();
						self.core.resource['globalBgImg'] = new Image();
						self.core.resource['globalBgImg'].onload = queue.resume;
						self.core.resource['globalBgImg'].src = 'img/bg_pattern_1.png';
					}
				},
				function fadeInBackground(queue, heap) {
					queue.pause();
					parent_queue.heap.html.addClass('withBgc', 800, queue.resume);
				},
				function setBackgroundImg(queue, heap) {
					parent_queue.heap.html.addClass('withBgi');
				},
				function showDialog(queue, heap) {
					queue.pause();
					self.core.frame['dialogWindow'].fadeIn(300, queue.resume);
				},
				function showOpeningView(queue, heap) {
					self.core.frame['dialogWindow'].contain(self.core.view['opening']);
				},
				function loadResources(queue, heap) {
					// fake resource loading time
					queue.pause(2000);
				},
				function returning(queue, heap) {
					if (typeof self.callback === 'function') {
						self.callback();
					}
					delete self.callback;
					self.busy = false;
				},
				PQUEUE_HALT
			], 0, 'ui')
		};
		self.core.frame['dialogWindow'].fix().appendTo(parent_queue.heap.body);
		self.core.frame['sideBar'].fix().appendTo(parent_queue.heap.body);
		
		self.api = {
			takeOver: function (callback) {
				if (self.busy) {
					console.error('mod_ui already running.');
					return false;
				} else {
					self.busy = true;
					if (typeof callback === 'function')
						self.callback = callback;
					self.core.sequence.boot();
					return true;
				}
			},
			dialogWindow: self.core.frame['dialogWindow'],
			sideBar: self.core.frame['sideBar']
		};
	}
	return self.api;
};
var mod_user = function (parent_queue) {
	var self = this;
	if (typeof self.core === 'undefined') {
		// initialization
		self.busy = false;
		self.core = {
			data: {
				privilege: 0, // guest by default
				secretKey: ((typeof localStorage.secretKey == 'undefined') ? '' : localStorage.secretKey),
				secretWord: ((typeof localStorage.secretWord == 'undefined') ? '' : localStorage.secretWord)
			},
			view: {
				// signin
				'restoring': $('<label class="singleLineNote font_mono nowrap">').text('RESTORING SESSION...'),
				'signInForm': $('<form id="signIn_form" class="aPos t50p l50p">').append(
					$('<div id="signIn_form_usernameFrame" class="formRow textInputFrame">').append(
						$('<label for="signIn_form_usernameField">username</label>'),
						$('<input id="signIn_form_usernameField" type="text" tabIndex="1" autocomplete="off" disabled="disabled">').val(localStorage.signIn_username)
					),
					$('<div id="signIn_form_passwordFrame" class="formRow textInputFrame">').append(
						$('<label for="signIn_form_passwordField">password</label>'),
						$('<input id="signIn_form_passwordField" type="password" tabIndex="2" autocomplete="off" disabled="disabled">').val(localStorage.signIn_password)
					),
					$('<div class="actions">').append(
						$('<button id="signIn_form_action_submit">').text(parent_queue.heap.str.check_submit)
					),
					$('<button id="signIn_form_submitButton" class="hidden" type="submit" disabled="disabled">></button>')
				),
				'error': $('<div class="signIn_status">').append(
					$('<div class="title">'),
					$('<div class="content">'),
					$('<div class="actions">').append(
						$('<button id="signIn_errorView_action_submit">').text(parent_queue.heap.str.check_ok)
					)
				),
				'initializing': $('<label class="singleLineNote font_mono nowrap">').text('SIGNING IN...'),
				'finishing': $('<label class="singleLineNote font_mono nowrap">').text('WELCOME BACK'),
				// signout
				'confirm': $('<div id="signOut_confirm" class="aPos t50p l50p">').append(
					$('<div class="content">').text('You are about to sign out.\nDo you want to proceed?'),
					$('<div class="actions">').append(
						$('<button id="signOut_confirm_action_confirm">').text(parent_queue.heap.str.check_confirm),
						$('<button id="signOut_confirm_action_cancel">').text(parent_queue.heap.str.cross_cancel)
					)
				),
				'signedOut': $('<label class="singleLineNote font_mono nowrap">').text('SIGNED OUT')
			},
			control: {
				'lockSignInForm': function () {
					self.core.view['signInForm'].find('#signIn_form_usernameField').prop('disabled', true);
					self.core.view['signInForm'].find('#signIn_form_passwordField').prop('disabled', true);
					self.core.view['signInForm'].find('#signIn_form_submitButton').prop('disabled', true);
				},
				'unlockSignInForm': function () {
					self.core.view['signInForm'].find('#signIn_form_usernameField').prop('disabled', false);
					self.core.view['signInForm'].find('#signIn_form_passwordField').prop('disabled', false);
					self.core.view['signInForm'].find('#signIn_form_submitButton').prop('disabled', false);
				},
				'signInForm_focusUsername': function () {
					self.core.view['signInForm'].find('#signIn_form_usernameField').focus();
				},
				'signInForm_getUsername': function () {
					return self.core.view['signInForm'].find('#signIn_form_usernameField').val();
				},
				'signInForm_getPassword': function () {
					return self.core.view['signInForm'].find('#signIn_form_passwordField').val();
				}
			},
			sequence: {
				'signIn': PQUEUE(null, [
					function analyzeSessionData(queue, heap) {
						// decide whether to restore user session from server or request a new one
						// since the server always have the correct data while the client doesn't
						// fetch session data from server anyway
						queue.pause();
						queue.pc.goto(queue.pc.locate('restoreUserSession'));
						parent_queue.heap.mod['ui'].dialogWindow.swap(self.core.view['restoring'], queue.resume);
					},
					function restoreUserSession(queue, heap) {
						// verify secretKey and secretWord with server
						// and retrive privilege level
						queue.pause();
						queue.pc.goto(queue.pc.locate('checkUserAuthorization'));
						parent_queue.heap.mod['server'].talk({
							action: 'restoreSession',
							key: self.core.data.secretKey,
							word: self.core.data.secretWord
						}, function (data, textStatus, jqXHR) {
							parent_queue.heap.api('note')('data.privilege: ' + data.privilege);
							parent_queue.heap.api('note')('data.sessionKey: ' + data.sessionKey);
							parent_queue.heap.api('note')('data.sessionWord: ' + data.sessionWord);
							self.core.data.privilege = data.privilege; // load privilege
							self.core.data.secretKey = localStorage.secretKey = data.sessionKey;
							self.core.data.secretWord = localStorage.secretWord = data.sessionWord;
							queue.resume();
						}, function (jqXHR, textStatus, errorThrown) {
							parent_queue.heap.api('alert')('signIn_restoreUserSession: ' + textStatus);
							queue.resume();
						});
					},
					function checkUserAuthorization(queue, heap) {
						if (self.core.data.privilege > 0) {
							queue.pc.goto(queue.pc.locate('signIn_complete'));
						} else {
							queue.pc.goto(queue.pc.locate('signIn_showForm'));
						}
						/*
						switch (self.core.data.privilege) {
							case 0: // guest
								break;
							case 1: // user
								break;
							case 2: // admin
								break;
							default:
						};
						*/
					},
					function signIn_showForm(queue, heap) {
						queue.pause();
						self.core.view['signInForm'].find('#signIn_form_action_submit').unbind('click').click(function () {
							queue.pc.goto(queue.pc.locate('signIn_request_sequenceHead'));
							queue.resume();
						});
						self.core.view['signInForm'].unbind('submit').submit(function () {
							queue.pc.goto(queue.pc.locate('signIn_request_sequenceHead'));
							queue.resume();
							return false;
						});
						parent_queue.heap.mod['ui'].dialogWindow.contain(self.core.view['signInForm'], queue.resume);
					},
					function signIn_waitForSubmission(queue, heap) {
						self.core.control.unlockSignInForm();
						self.core.control.signInForm_focusUsername();
						queue.pause();
					},
					function signIn_request_sequenceHead(queue, heap) {},
					function signIn_request_validateForm(queue, heap) {
						self.core.control.lockSignInForm();
						self.core.data['signInRequestData'] = [];
						localStorage.signIn_username = self.core.data['signInRequestData']['username'] = self.core.control.signInForm_getUsername();
						localStorage.signIn_password = self.core.data['signInRequestData']['password'] = self.core.control.signInForm_getPassword();
						// I don't really remember what this line is for
					//	if (typeof signIn['errorMsg'] !== 'undefined') signIn['errorMsg'].close();
						if (self.core.data['signInRequestData']['username'] === '') {
							queue.pc.goto(queue.pc.locate('signIn_request_alert_usernameEmpty'));
						} else if (!self.core.data['signInRequestData']['username'].match(/^[_a-z][_0-9a-z]{4,}$/i)) {
							queue.pc.goto(queue.pc.locate('signIn_request_alert_usernameInvalid'));
						} else {
							queue.pc.goto(queue.pc.locate('signIn_request_showInitializationView'));
						}
					},
					function signIn_request_alert_usernameEmpty(queue, heap) {
						self.core.view['error'].find('.content').html('<h4>AUTHENTICATION FAILURE</h4><p>Username is required.</p>');
						queue.pc.goto(queue.pc.locate('signIn_request_alert_showView'));
					},
					function signIn_request_alert_usernameInvalid(queue, heap) {
						self.core.view['error'].find('.content').html('<h4>AUTHENTICATION FAILURE</h4><p>Invalid username.</p>');
						queue.pc.goto(queue.pc.locate('signIn_request_alert_showView'));
					},
					function signIn_request_alert_verificationFailure(queue, heap) {
						self.core.view['error'].find('.content').html('<h4>AUTHENTICATION FAILURE</h4><p>Username and password dis-match.</p>');
						queue.pc.goto(queue.pc.locate('signIn_request_alert_showView'));
					},
					function signIn_request_alert_timeout(queue, heap) {
						self.core.view['error'].find('.content').html('<h4>AUTHENTICATION FAILURE</h4><p>Connection timeout.</p>');
						queue.pc.goto(queue.pc.locate('signIn_request_alert_showView'));
					},
					function signIn_request_alert_serverError(queue, heap) {
						self.core.view['error'].find('.content').html('<h4>EXCEPTION</h4><p>Server error.</p>');
						queue.pc.goto(queue.pc.locate('signIn_request_alert_showView'));
					},
					function signIn_request_alert_unknownError(queue, heap) {
						self.core.view['error'].find('.content').html('<h4>EXCEPTION</h4><p>Unknown Error.</p>');
						queue.pc.goto(queue.pc.locate('signIn_request_alert_showView'));
					},
					function signIn_request_alert_showView(queue, heap) {
						queue.pause();
						self.core.view['error'].find('#signIn_errorView_action_submit').unbind('click').click(function signIn_request_confirmAlert() {
							queue.pc.goto(queue.pc.locate('signIn_showForm'));
							queue.resume();
						});
						parent_queue.heap.mod['ui'].dialogWindow.contain(self.core.view['error'], queue.resume);
					},
					function signIn_request_alert_waitForConfirmation(queue, heap) {
						queue.pause();
					},
					function signIn_request_showInitializationView(queue, heap) {
						queue.pause();
						parent_queue.heap.mod['ui'].dialogWindow.contain(self.core.view['initializing'], queue.resume);
					},
					function signIn_request_submitForm(queue, heap) {
						queue.pause();
						parent_queue.heap.mod['server'].talk({
							action: 'signIn',
							username: self.core.data['signInRequestData']['username'],
							password: self.core.data['signInRequestData']['password']
						}, function (data, textStatus, jqXHR) {
							if (typeof data.statusBits === 'undefined') {
								queue.pc.goto(queue.pc.locate('signIn_request_alert_serverError'));
							} else {
								//	parent_queue.heap.api('note')('data.statusBits: ' + data.statusBits.toString(2));
								if (data.statusBits & 0x80) {
									// failure
									if (data.statusBits & 0x01) {
										queue.pc.goto(queue.pc.locate('signIn_request_alert_usernameEmpty'));
									} else if (data.statusBits & 0x02) {
										queue.pc.goto(queue.pc.locate('signIn_request_alert_usernameInvalid'));
									} else if (data.statusBits & 0x04) {
										queue.pc.goto(queue.pc.locate('signIn_request_alert_verificationFailure'));
									} else {
										queue.pc.goto(queue.pc.locate('signIn_request_alert_unknownError'));
									}
								} else {
									// success
									self.core.data.privilege = data.privilege; // load privilege
									self.core.data.secretKey = localStorage.secretKey = data.sessionKey;
									parent_queue.heap.api('note')('data.sessionKey: ' + localStorage.secretKey);
									self.core.data.secretWord = localStorage.secretWord = data.sessionWord;
									parent_queue.heap.api('note')('data.sessionWord: ' + localStorage.secretWord);
									queue.pc.goto(queue.pc.locate('signIn_complete'));
								}
							}
							queue.resume();
						}, function (jqXHR, textStatus, errorThrown) {
							parent_queue.heap.api('alert')('signIn_request_submitForm: ' + textStatus);
							switch (textStatus) {
								case 'timeout':
									queue.pc.goto(queue.pc.locate('signIn_request_alert_timeout'));
									break;
								case 'error':
									// [to-do]
									alert(errorThrown);
									break;
								case 'abort':
									parent_queue.heap.api('alert')('sign-in request aborted.');
									queue.pc.goto(queue.pc.locate('signIn_showForm'));
									break;
								case 'parsererror':
									parent_queue.heap.api('alert')('can not parse sign-in response.');
									break;
								default:
									// [to-do]
									alert('unknown error');
							}
						});
					},
					function signIn_complete(queue, heap) {
						queue.pause();
						parent_queue.heap.mod['ui'].dialogWindow.swap(self.core.view['finishing'], queue.resume);
					},
					function signIn_cleaning(queue, heap) {
						queue.pause();
						parent_queue.heap.mod['ui'].dialogWindow.collapse().fadeOut(queue.resume);
					},
					function returning(queue, heap) {
						if (typeof self.callback === 'function') {
							self.callback();
						}
						delete self.callback;
						self.busy = false;
					},
					PQUEUE_HALT
				], 0, 'signIn'),
				'signOut': PQUEUE(null, [
					function disableModules(queue, heap) {
						parent_queue.heap.mod['main']['moduleList'].disableAll();
					},
					function showDialog(queue, heap) {
						queue.pause();
						parent_queue.heap.mod['ui'].dialogWindow.fadeIn(300, queue.resume);
					},
					function showConfirmView(queue, heap) {
						self.core.view['confirm'].find('#signOut_confirm_action_confirm').unbind('click').click(function () {
							queue.pc.goto(queue.pc.locate('request_sequenceHead'));
							queue.resume();
						});
						self.core.view['confirm'].find('#signOut_confirm_action_cancel').unbind('click').click(function () {
							queue.pc.goto(queue.pc.locate('canceled'));
							queue.resume();
						});
						parent_queue.heap.mod['ui'].dialogWindow.contain(self.core.view['confirm']);
					},
					function waitForSubmission(queue, heap) {
						queue.pause();
					},
					function request_sequenceHead(queue, heap) {
						
					},
					function request_submit(queue, heap) {
						queue.pause();
						parent_queue.heap.mod['server'].talk({
							action: 'signOut'
						}, function (data, textStatus, jqXHR) {
							if (typeof data.statusBits === 'undefined') {
							//	queue.pc.goto(queue.pc.locate('request_alert_serverError'));
							} else {
								if (data.statusBits & 0x80) {
								//	queue.pc.goto(queue.pc.locate('request_alert_unknownError'));
								} else {
									// success
									self.core.data.privilege = data.privilege; // load privilege
									self.core.data.secretKey = localStorage.secretKey = data.sessionKey;
									parent_queue.heap.api('note')('data.sessionKey: ' + localStorage.secretKey);
									self.core.data.secretWord = localStorage.secretWord = data.sessionWord;
									parent_queue.heap.api('note')('data.sessionWord: ' + localStorage.secretWord);
									queue.pc.goto(queue.pc.locate('request_complete'));
								}
							}
							queue.resume();
						}, function (jqXHR, textStatus, errorThrown) {
							parent_queue.heap.api('alert')('signOut_request_submit: ' + textStatus);
							switch (textStatus) {
								case 'timeout':
									queue.pc.goto(queue.pc.locate('request_alert_timeout'));
									break;
								case 'error':
									// [to-do]
									alert(errorThrown);
									break;
								case 'abort':
									parent_queue.heap.api('alert')('sign-out request aborted.');
									queue.pc.goto(queue.pc.locate('canceled'));
									break;
								case 'parsererror':
									parent_queue.heap.api('alert')('can not parse sign-out response.');
									break;
								default:
									// [to-do]
									alert('unknown error');
							}
						});
					},
					function request_complete(queue, heap) {
						heap.view = {};
						heap.view['sideBar'] = parent_queue.heap.mod['ui'].sideBar;
						parent_queue.pc.goto(parent_queue.pc.locate('setup_user'));
					},
					function hideInterfaces(queue, heap) {
						// find all visible interfaces (windows, etc) and hide them
						// prepare race set
						var raceSet = [];
						for (var key in heap.view) {
							raceSet.push(key);
						}
						// if there is nothing, skip this process
						if (raceSet.length === 0) return;
						queue.pause();
						var race = SETRACE(raceSet, queue.resume);
						for (var key in heap.view) {
							if (typeof heap.view[key].collapse === 'function') {
								heap.view[key].collapse(300, race.set[key]).fadeOut(300);
							} else {
								race.set[key]();
							}
						}
					},
					function ending(queue, heap) {
						queue.pause();
						queue.pc.goto(queue.pc.locate('resetButton'));
						parent_queue.heap.mod['ui'].dialogWindow.swap(self.core.view['signedOut'], queue.resume);
					},
					function canceled(queue, heap) {
						queue.pause();
						parent_queue.heap.mod['ui'].dialogWindow.collapse().fadeOut(queue.resume);
					},
					function enableModules(queue, heap) {
						parent_queue.heap.mod['main']['moduleList'].enableAll();
					},
					function resetButton(queue, heap) {
						parent_queue.heap.mod['main']['moduleList']['signOutButton'].removeClass('selected');
					//	queue.pc.goto(queue.pc.locate('returning'));
					},
					function returning(queue, heap) {
						if (typeof self.callback === 'function') {
							self.callback();
						}
						delete self.callback;
						self.busy = false;
					},
					PQUEUE_HALT
				], 0, 'signOut')
			}
		};
		
		self.api = {
			signIn: function (callback) {
				if (self.busy) {
					console.error('mod_user is busy.');
					return false;
				} else {
					self.busy = true;
					if (typeof callback === 'function')
						self.callback = callback;
					self.core.sequence.signIn.boot();
					return true;
				}
			},
			signOut: function (callback) {
				if (self.busy) {
					console.error('mod_user is busy.');
					return false;
				} else {
					self.busy = true;
					if (typeof callback === 'function')
						self.callback = callback;
					self.core.sequence.signOut.reset().boot();
					return true;
				}
			}
		};
	}
	
	return self.api;
};
