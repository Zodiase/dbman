<?php

namespace mods {
	interface singularity
	{
		static function instance();
	}
	interface respondModule extends singularity
	{
		public function respond();
	}

	class loader
	{
		const baseUrl = __DIR__;
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
		private function __construct()
		{
			spl_autoload_register(array($this, 'autoLoad'));
		}
		private $stack = array();
		private function autoLoad($className)
		{
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
				array_push($this->stack, $className);
				include $assumedPath;
			}
		}
		public function load($className)
		{
			$this->autoLoad($className);
		}
		//>>> convertion to string
		public function __toString()
		{
			$count = count($this->stack);
			$result = "mods loaded ({$count}) {\n";
			for ($i = 0; $i < $count; ++$i) {
				$result .= "	{$this->stack[$i]}\n";
			}
			$result .= "}";
			return $result;
		}
		//<<< convertion to string
	}
}
?>