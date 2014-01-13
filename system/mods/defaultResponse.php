<?php
namespace mods {
	class defaultResponse
	{
		public $request, $sessionKey, $sessionWord, $privilege, $logs;
		public function __construct()
		{
			$this->request->timestamp = (string)microtime(true);
			$this->request->target = '';
			$this->request->arguments = '';
			$this->sessionKey = '';
			$this->sessionWord = '';
			$this->privilege = 0;
			$this->logs = array();
		}
		public function log($message)
		{
			$timestamp = microtime(true);
			array_push($this->logs, "@{$timestamp}::{$message}");
		}
	}
}
?>