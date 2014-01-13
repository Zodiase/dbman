<?php
namespace {
	/*=== Initializing ===*/
	// start php session module
	session_start();
	// load module loader
	include_once('mod_loader.php');
	// initialize module loader
	$mod_loader = \mods\loader::instance();
	// prepare response object
	global $response;
	$response = new \mods\defaultResponse();
	// initialize session object
	$session = \mods\session::instance();
	// initialize request object
	$request = \mods\request::instance();
	
	/*=== Processing Request ===*/
	// get the requested module name
	$modName = $request->modName();
	// compile module class name (with namespace)
	$modClassName = "\\mods\\{$modName}";
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
			$requestedMod->respond();
		}
	}
	
	/*=== Outputting ===*/
	// set header for json
	header('Content-type: application/json');
	// print response
	echo json_encode($response);
}
?>