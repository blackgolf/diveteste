<?php
session_start();
ini_set('display_errors', 1);
error_reporting(~0);
header('Access-Control-Allow-Origin: *'); 
header("Access-Control-Allow-Credentials: true"); 
header('Access-Control-Allow-Methods: GET'); 
header('Access-Control-Allow-Headers: X-Requested-With');
header('Access-Control-Allow-Headers: Content-Type');

require('lib.php');
require('config.php');
if(!isset($_SESSION['access_token'])){
	if(!isset($_GET['code'])){
		$meetup = new Meetup();
		$meetup->authorize([
			'client_id'		=> $meetupapp['client_id'],
			'redirect_uri'	=> $meetupapp['redirect_uri']
		]);
	} else {
		//assuming we came back here...
		$meetup = new Meetup([
			"client_id"		=> $meetupapp['client_id'],
			"client_secret" => $meetupapp['client_secret'],
			"redirect_uri"	=> $meetupapp['redirect_uri'],
			"code"			=> $_GET['code']
		]);

		//get an access token
		$response = $meetup->access();

		//now we can re-use this object for several requests using our access
		//token
		$meetup = new Meetup(
			["access_token"	=> $response->access_token]
		);

		//store details for later in case we need to do requests elsewhere
		//or refresh token
		$_SESSION['access_token'] = $response->access_token;
		$_SESSION['refresh_token'] = $response->refresh_token;
		$_SESSION['expires'] = time() + intval($response->expires_in); //use if >= intval($_SESSION['expires']) to check


		//get all groups for this member
		$response = $meetup->get('/2/profiles', ['member_id'=>'self']);
		echo json_encode($response);
	}
} else {
	$meetup = new Meetup(
		["access_token"	=> $_SESSION['access_token']]
	);

	if(!isset($_GET['method'])){
		$method = 'get';
	} else {
		$method = $_GET['method'];
	}

	if(!isset($_GET['api'])){
		$api = '/2/profiles';
	} else {
		$api = $_GET['api'];
	}

	if(!isset($_GET['params'])){
		$params = ['member_id'=>'self'];
	} else {
		$params = [];
		$paramslist = explode(',', $_GET['params']);
		foreach ($paramslist as $key => $value) {
			$temp = explode(':', $value);
			$params[$temp[0]] = $temp[1];
		}
	}

	switch ($method) {
		case 'get':
			$response = $meetup->get($api, $params);
			break;
		case 'post':
			$response = $meetup->get($api, $params);
			break;
	}
	echo json_encode($response);
}?>