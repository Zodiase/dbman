<?php
namespace {
	/*=== Initializing ===*/
	global $sysStartTime;
	$sysStartTime = microtime(true);
	// start php session module
	session_start();
	// enable output buffering
	ob_start();
	if (is_file('configs.php'))
		include_once('configs.php');
	// load basic modules
	include_once('mod_basics.php');
	// load module loader
	include_once('mod_loader.php');
	// initialize module loader
	$mod_loader = \NS_Mods\Loader::instance();
	// prepare response object
	global $response;
	$response = \NS_Mods\Response::instance();
	// initialize session object
	$session = \NS_Mods\Session::instance();
	// initialize request object
	$request = \NS_Mods\Request::instance();
	
	/*=== Processing Request ===*/
	// get the requested module name
	$modName = $request->modName();
	// compile module class name (with namespace)
	$modClassName = "\\NS_Mods\\{$modName}";
	// update target in the response
	$response->request->target = $modName;
	// ask the corresponding module to respond to the request
	if (!class_exists($modClassName)) {
		$response->log("error: could not found mod {$modName}.");
	} else {
		$requestedMod = new $modClassName;
		if (!method_exists($requestedMod, 'respond')) {
			$response->log("error: mod {$modName} invalid.");
		} else {
			$requestedMod->respond($response);
		}
	}
	// record run time
	$response->runtime = microtime(true) - $sysStartTime;
	// record loaded files
	$response->mods = $mod_loader->listFiles();
	
	/*=== Outputting ===*/
	// just exit and response module will handle the rest
	exit('[STE]');
}
?>