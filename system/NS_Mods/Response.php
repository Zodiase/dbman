<?php
namespace NS_Mods {
	class PHPError {
		public $errno, $errstr, $errfile, $errline, $errcontext, $errtime;
		public function __construct($errno, $errstr, $errfile, $errline, $errcontext) {
			$this->errtime = microtime(true);
			$this->errno = $errno;
			$this->errstr = $errstr;
			$this->errfile = $errfile;
			$this->errline = $errline;
			$this->errcontext = $errcontext;
		}
	}
	
	interface I_Response extends I_Singularity {
		function __construct();
		function log($message);
		function err($message);
	}

	class Response implements I_Response {
		//>>> singularity mode
		protected static $self = null;
		public static function instance() {
			if (self::$self === null) {
				self::$self = new self;
			}
			return self::$self;
		}
		//<<< singularity mode
		public $request, $sessionKey, $sessionWord, $statusBits,
			$privilege, $username, $runtime, $errs, $logs, $mods,
			$phperr, $ob;
		public function __construct() {
			$this->request->timestamp = (string)microtime(true);
			$this->request->target = '';
			$this->request->arguments = '';
			$this->sessionKey = '';
			$this->sessionWord = '';
			$this->statusBits = 0;
			$this->privilege = 0;
			$this->username = '';
			$this->runtime = 0;
			$this->logs = array();
			$this->errs = array();
			$this->mods = array();
			$this->phperr = array();
			$this->ob = '';
			// register error handler
			set_error_handler(array($this, 'handleError'), E_ALL);
			// register shutdown handler
			register_shutdown_function(array($this, 'send'));
		}
		public function log($message) {
			$timestamp = microtime(true);
			array_push($this->logs, "@{$timestamp}::{$message}");
		}
		public function err($message) {
			$timestamp = microtime(true);
			array_push($this->errs, "@{$timestamp}::{$message}");
		}
		private function handleError($errno, $errstr, $errfile, $errline, $errcontext) {
			array_push($this->phperr, new PHPError($errno, $errstr, $errfile, $errline, $errcontext));
			return;
		}
		public function send() {
			// get and clean the output buffer
			$this->ob = ob_get_clean();
			// set header for json
			header('Content-type: application/json');
			// print response
			exit(json_encode($this));
		}
	}
}
?>