<?php
function connect_default ()
{
	$host = 'db444782452.db.1and1.com';
	$user = 'dbo444782452';
	$pass = 'QgZLo3jqnYsAynRJxit4cvNoLnGJJpmt';
	
	return mysql_connect($host, $user, $pass);
}
?>