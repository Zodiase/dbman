<?php
namespace mods {
	interface I_SESSION extends singularity
	{
		function get_clientKey();
		function get_clientWord();
		function get_sessionUsername();
		function restore_session($sessionKey, $sessionWord);
		function sign_user($username);
	}
	define('SESSIONDIR', dirname(loader::baseUrl) . '/sessions');
	class session implements I_SESSION
	{
		//>>> singularity mode
		private static $self = null;
		public static function instance()
		{
			if (self::$self === null) {
				self::$self = new self;
			}
			return self::$self;
		}
		//<<< singularity mode

		private $clientAddress,
				$sessionFolderUrl,
				$clientRequestTime,
				$clientUsername,
				$clientPrivilege,
				$clientKey,
				$clientWord,
				$clientSessionSecret;
		private function load_client_address()
		{
			$this->clientAddress = $_SERVER['REMOTE_ADDR'];
		}
		private function locate_session_folder()
		{
			$this->sessionFolderUrl = SESSIONDIR . "/{$this->clientAddress}";
			if (!is_dir($this->sessionFolderUrl))
				mkdir($this->sessionFolderUrl);
		}
		private function set_timestamp()
		{
			$this->clientRequestTime = microtime(true);
		}
		public function __construct()
		{
			global $response;
			
			$this->load_client_address();
			$this->locate_session_folder();
			$this->set_timestamp();
			$response->log("[SESSION]: initiating session from {$this->clientAddress}.");
			if (!(array_key_exists('key', $_SESSION) && array_key_exists('word', $_SESSION) && $this->restore_session($_SESSION['key'], $_SESSION['word']))) {
				$this->create_session();
			}
		}
		
		private function create_sessionKey()
		{
			$randValue = rand();
			return md5("session of {$this->clientAddress} since {$this->clientRequestTime} with rand({$randValue})");
		}
		
		private function get_sessionFileUrl($sessionKey)
		{
			return "{$this->sessionFolderUrl}/session_{$sessionKey}.ini";
		}
		private function sessionFile_exists($sessionKey)
		{
			return is_file($this->get_sessionFileUrl($sessionKey));
		}
		private function read_sessionFile($sessionKey)
		{
			return parse_ini_file($this->get_sessionFileUrl($sessionKey));
		}
		private function delete_sessionFile($sessionKey)
		{
			if ($this->sessionFile_exists($sessionKey))
				unlink($this->get_sessionFileUrl($sessionKey));
		}
		private function write_sessionFile($sessionKey, $sessionFile)
		{
			$sessionFileContent = '';
			foreach ($sessionFile as $key => $value) {
				$sessionFileContent .= "{$key} = {$value}\n";
			}
			file_put_contents($this->get_sessionFileUrl($sessionKey), $sessionFileContent);
		}
		
		private function save_session()
		{
			global $response;
			$sessionFile = array();
			$sessionFile['username'] = $this->clientUsername;
			// update timestamp
			$sessionFile['lastActivity'] = $this->clientRequestTime;
			$sessionFile['secret'] = $this->clientSessionSecret;
			$sessionFile['address'] = $this->clientAddress;
			$response->log("[SESSION]: writing session file.");
			$this->write_sessionFile($this->clientKey, $sessionFile);
		}
		/**
		 * void create_session
		 * This function creates a new session for a new connection.
		 * While this session might be temporary (it will expire if
		 * the client successfully restores a previous session), it
		 * will otherwise be the designated session for this client
		 * at this IP address from now on.
		 */
		private function create_session()
		{
			$this->clientKey = $this->create_sessionKey();
			$this->sign_user('');
		}
		public function restore_session($sessionKey, $sessionWord)
		{
			if (!$this->sessionFile_exists($sessionKey))
				return false;
			$sessionFile = $this->read_sessionFile($sessionKey);
			if (!array_key_exists('username', $sessionFile))
				return false;
			$username = strval($sessionFile['username']);
			if (!array_key_exists('secret', $sessionFile))
				return false;
			$sessionSecret = strval($sessionFile['secret']);
			$verifySecret = $this->get_sessionSecret($username, $sessionWord);
			if ($sessionSecret !== $verifySecret)
				return false;
			// remove old temporary session
		//	if ($this->clientUsername === '')
		//		$this->delete_sessionFile($this->clientKey);
			// restore session
			$_SESSION['key'] = $this->clientKey = $sessionKey;
			$_SESSION['word'] = $this->clientWord = $sessionWord;
			$this->clientUsername = $username;
			$this->clientSessionSecret = $sessionSecret;
			// update timestamp
			$sessionFile['lastActivity'] = $this->clientRequestTime;
			$this->write_sessionFile($sessionKey, $sessionFile);
			return true;
		}
		
		public function get_clientKey()
		{
			return strval($this->clientKey);
		}
		public function get_clientWord()
		{
			return strval($this->clientWord);
		}
		public function get_sessionUsername()
		{
			return strval($this->clientUsername);
		}
		private function get_sessionWord($username, $address)
		{
			$randValue = rand();
			return md5("{$username},from:{$address} with rand({$randValue})");
		}
		private function get_sessionSecret($username, $sessionWord)
		{
			return md5("{$username}({$sessionWord})");
		}
		public function sign_user($username = '')
		{
			global $response;
			$this->clientUsername = $username;
			$response->log("[SESSION]: signing user [{$username}].");
			$_SESSION['key'] = $this->clientKey;
			$_SESSION['word'] = $this->clientWord = $this->get_sessionWord($username, $this->clientAddress);
			$this->clientSessionSecret = $this->get_sessionSecret($username, $this->clientWord);
			$this->save_session();
			return strval($this->clientWord);
		}
	}
}
?>