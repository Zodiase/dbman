<?php
namespace {
	session_start();
	include_once('mod_loader.php');
	$mod_loader = \mods\loader::instance();
	global $response;
	$response = new \mods\defaultResponse();
	
	$session = \mods\session::instance();
	$request = \mods\request::instance();
	$modName = $request->modName();
	$modClassName = "\\mods\\{$modName}";
	$response->request->target = $modName;
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
	echo json_encode($response);
}



/*
include_once('connection.php');

if (!connect_default())
	trigger_error("Could not connect to server", E_USER_ERROR);

if (!array_key_exists('server', $_GET))
	trigger_error("No server specified", E_USER_ERROR);

// lock target



switch ($_GET['target']) {
	case 'server':
		switch ($_GET['action']) {
			case 'read': // read server data (database list)
				break;
			case 'write': // write server data (modify databases, though not likely)
				break;
		}
		break;
	case 'db':
	case 'database':
		switch ($_GET['action']) {
			case 'create': // create a table
				break;
			case 'alter': // alter a table
				break;
			case 'drop': // drop a table
				break;
			default: // unknown action
		}
		break;
	case 'tb':
	case 'table':
		switch ($_GET['action']) {
			case 'select': // select entries
				break;
			case 'read': // read an entry
				break;
			case 'insert': // insert an entry
				break;
			case 'update': // update an entry
				break;
			case 'delete': // delete an entry
				break;
			default: // unknown action
		}
		break;
	default:
		die('unknown target');
}
mysql_close();
*/
?>