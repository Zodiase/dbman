<?php
namespace mods {
	class request implements singularity
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
		private $mod = '';
		private $args = array();
		private $postArgs = array();
		private $getArgs = array();
		private function __construct()
		{
			$modQueryName = 'mod';
			if (array_key_exists($modQueryName, $_GET)) {
				switch (strtolower($_GET[$modQueryName])) {
					default:
						$this->mod = 'error';
				}
			} else {
				$this->mod = 'client';
			}
			
			foreach ($_GET as $key => $data) {
				$this->args[$key] = $this->getArgs[$key] = $data;
			}
			// POST overrides GET data in $args
			foreach ($_POST as $key => $data) {
				$this->args[$key] = $this->postArgs[$key] = $data;
			}
		}
		public function modName()
		{
			return $this->mod;
		}
		public function getArg($argname)
		{
			if (!array_key_exists($argname, $this->args))
				return '';
			return $this->args[$argname];
		}
		public function getGETArg($argname)
		{
			if (!array_key_exists($argname, $this->getArgs))
				return '';
			return $this->getArgs[$argname];
		}
		public function getPOSTArg($argname)
		{
			if (!array_key_exists($argname, $this->postArgs))
				return '';
			return $this->postArgs[$argname];
		}
		//>>> convertion to string
		public function __toString()
		{
			$count = count($this->args);
			$result = "mod: {$this->mod} {\n";
			foreach ($this->args as $key => $data) {
				$result .= "	{$key} = {$data}\n";
			}
			$result .= "}";
			return $result;
		}
		//<<< convertion to string
	}
}
?>