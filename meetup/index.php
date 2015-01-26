<?php
echo 'start<br>';
$r = new HttpRequest('https://secure.meetup.com/oauth2/access?client_id=5gefnsti32oruqceedbl0q0jag&client_secret=ake993sske7re8q4a7qk05si0l&grant_type=authorization_code&redirect_uri=https://ktdigital.asia/fv0010&code=cf41ba35d0d8f48230f4f867fd9e96c1', HttpRequest::METH_POST);
$r->setOptions(array('cookies' => array('lang' => 'de')));
$r->addPostFields(array('user' => 'mike', 'pass' => 's3c|r3t'));
$r->addPostFile('image', 'profile.jpg', 'image/jpeg');
try {
    echo $r->send()->getBody();
} catch (HttpException $ex) {
    echo $ex;
}
var_dump($r->send);
?>