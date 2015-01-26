<?php
header('Access-Control-Allow-Origin: *');  
require('lib.php');
if(!isset($_GET['code'])){
	echo 'start';
	$meetup = new Meetup();
	$meetup->authorize([
		'client_id'		=> '5gefnsti32oruqceedbl0q0jag',
		'redirect_uri'	=> 'http://128.199.146.12:5000'] 
	);
} else {
	//assuming we came back here...
	$meetup = new Meetup([
		"client_id"		=> '5gefnsti32oruqceedbl0q0jag',
		"client_secret" => 'ake993sske7re8q4a7qk05si0l',
		"redirect_uri"	=> 'http://128.199.146.12:5000',
		"code"			=> $_GET['code']
		]
	);

	//get an access token
	$response = $meetup->access();
	echo $response->access_token;

	// //now we can re-use this object for several requests using our access
	// //token
	// $meetup = new Meetup(
	// 	["access_token"	=> $response->access_token]
	// );

	// //store details for later in case we need to do requests elsewhere
	// //or refresh token
	// $_SESSION['access_token'] = $response->access_token;
	// $_SESSION['refresh_token'] = $response->refresh_token;
	// $_SESSION['expires'] = time() + intval($response->expires_in); //use if >= intval($_SESSION['expires']) to check

	// //get all groups for this member
	// $response = $meetup->get('/2/profiles', ['member_id'=>'self']);
	// echo json_encode($response);
}?>