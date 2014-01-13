<?php
namespace NS_Mods {
	interface I_Loader extends I_Singularity {
		// interface function for manually loading one file
		function load($className);
		// list loaded files
		function listFiles();
		// convertion to string
		function __toString();
	}

	class Loader implements I_Loader {
		const baseUrl = __DIR__;
		//>>> singularity mode
		protected static $self = null;
		public static function instance() {
			if (self::$self === null) {
				self::$self = new self;
			}
			return self::$self;
		}
		//<<< singularity mode
		private function __construct() {
			spl_autoload_register(array($this, 'autoLoad'));
		}
		private $loaded_files = array();
		private function autoLoad($className) {
			/**
			 * add className validating here to enhance security
			 * mainly to avoid the following senarios:
			 *     className containing '../' to load unsafe files
			 */
			$className = str_replace("\\", '/', $className);
			$phpFilename = $className . '.php';
			$assumedPath = self::baseUrl . '/' . $phpFilename;
			if (!is_file($assumedPath)) {
				#trigger_error("Could not find file {$phpFilename}", E_USER_ERROR);
			} else {
				array_push($this->loaded_files, $className);
				include $assumedPath;
			}
		}
		
		public function load($className) {
			$this->autoLoad($className);
		}
		
		public function listFiles() {
			return $this->loaded_files;
		}
		
		public function __toString() {
			$count = count($this->loaded_files);
			$result = "mods loaded ({$count}) {\n";
			for ($i = 0; $i < $count; ++$i) {
				$result .= "	{$this->loaded_files[$i]}\n";
			}
			$result .= "}";
			return $result;
		}
	}
}
?>