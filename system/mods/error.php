<?php
namespace mods {
	class error implements respondModule
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
			$result = new errorResponse;
			$result->errorMessage = "Mod [{$_GET['mod']}] not found or is not a responsive module.";
			return $result;
		}
	}
}
?>