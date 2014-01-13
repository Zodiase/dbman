<?php
namespace mods {
	class client implements respondModule
	{
		//>>> singularity mode
		protected static $self = null;
		public static function instance()
		{
			if (self::$self === null) {
				self::$self = new self;
			}
			return self::$self;
		}
		//<<< singularity mode
		
		public function respond()
		{
			$request = request::instance();
			$session = session::instance();
			$user = user::instance();
			
			global $response;
			
			switch ($request->getArg('action')) {
				case 'restoreSession':
					$sessionKey = $request->getArg('key');
					$sessionWord = $request->getArg('word');
					$response->verified = ($session->restore_session($sessionKey, $sessionWord)) ? true : false;
					break;
				case 'signOut':
					// initialize status bits
					$statusBits = 0;
					$session->sign_user();
					// fill response
					$response->statusBits = $statusBits;
					break;
				case 'signIn':
				//	$username = $request->getPOSTArg('username');
				//	$password = $request->getPOSTArg('password');
					$username = $request->getArg('username');
					$password = $request->getArg('password');
					// initialize status bits
					$statusBits = 0;
					// verify username
					if ($username === '') {
					//	$response->log("[CLIENT] warning: username empty.");
						$statusBits |= 0x1; // +1
					}
					if (!$user->validateUserName($username)) { // validate username
					//	$response->log("[CLIENT] warning: username empty.");
						$statusBits |= 0x2; // +2
					} elseif (!$user->locateUser($username)) { // find user
					//	$response->log("[CLIENT] warning: user not found.");
						$statusBits |= 0x4; // +4
					} elseif (!$user->verifyPassword($password)) { // verify password
					//	$response->log("[CLIENT] warning: wrong password.");
						$statusBits |= 0x4; // +4
					}
					if ($statusBits !== 0) { // verification failed
						$statusBits |= 0x80; // +128
					} else { // verification passed
						$session->sign_user($username);
					}
					$statusBits &= 0xFF;
					// fill response
					$response->statusBits = $statusBits;
					break;
			}
			$user->locateUser($session->get_sessionUsername());
			// write to result object
			$response->sessionKey = $session->get_clientKey();
			$response->sessionWord = $session->get_clientWord();
			$response->username = $session->get_sessionUsername();
			$response->privilege = $user->getPrivilege();
		}
	}
}
?>