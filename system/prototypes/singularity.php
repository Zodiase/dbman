<?php
namespace prototypes {
	class singularity
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
	}
}
?>