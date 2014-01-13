<?php
namespace NS_Mods {
	define('USERDIR', dirname(loader::baseUrl) . '/users');
	class User implements I_Singularity
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

		private function __construct()
		{}
		
		public function validateUserName($username)
		{
			return preg_match("/^[_a-z][_0-9a-z]{4,}$/uis", $username);
		}
		
		private $username, $password, $privilege, $userFolderUrl, $passwordVerified;
		public function locateUser($username)
		{
			// reset
			$this->username = '';
			$this->password = '';
			$this->privilege = 0;
			$this->userFolderUrl = '';
			$this->passwordVerified = false;
			// validate user name
			if (!$this->validateUserName($username))
				return false;
			// validate folder url
			$expectedFolderUrl = USERDIR . "/{$username}";
			if (!is_dir($expectedFolderUrl))
				return false;
			// verify ini file
			$passwordHashFileUrl = "{$expectedFolderUrl}/passwordHash_latest.ini";
			if (!is_file($passwordHashFileUrl))
				return false;
			$passwordHashFile = parse_ini_file($passwordHashFileUrl);
			
			$this->username = $username;
			$this->password = $passwordHashFile['hash'];
			$this->privilege = $passwordHashFile['privilege'];
			$this->userFolderUrl = $expectedFolderUrl;
			
			return true;
		}
		
		private function getPasswordHash($privilege, $username, $password)
		{
			return md5("level{$privilege}/{$username}@dbman:{$password}");
		}
		public function verifyPassword($password)
		{
			$passwordHashValue = $this->getPasswordHash($this->privilege, $this->username, $password);
			if ($passwordHashValue === $this->password) {
				$this->passwordVerified = true;
				return true;
			} else {
				return false;
			}
		}
		public function getPrivilege()
		{
			return intval($this->privilege);
		}
	}
}
?>