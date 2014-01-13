<?php
namespace NS_Mods {
	class Error implements I_RespondModule {
		//>>> singularity mode
		protected static $self = null;
		public static function instance() {
			if (self::$self === null) {
				self::$self = new self;
			}
			return self::$self;
		}
		//<<< singularity mode
		
		public function respond(&$response) {
			$response->err("Mod [{$_GET['mod']}] not found or is not a responsive module.");
		}
	}
}
?>