<?php
namespace {
	session_start();
	include_once('mod_loader.php');
	$mod_loader = \mods\loader::instance();
	$user = \mods\user::instance();
}
?>