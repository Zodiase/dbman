<?php
namespace NS_Mods {
	interface I_Singularity {
		static function instance();
	}
	
	interface I_RespondModule extends I_Singularity {
		// static function instance();
		function respond(&$response);
	}
}
?>