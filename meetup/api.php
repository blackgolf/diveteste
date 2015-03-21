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
$_SESSION['access_token'] = $_GET['access_token'];
$meetup = new Meetup(
    ["access_token"	=> $_GET['access_token']]
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
    if ($api == '/2/rsvps') {
        $api = '/2/rsvps?event_id='.$_GET['event_id'].'&key='.$_GET['access_token'];
    }
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
echo json_encode($response);?>