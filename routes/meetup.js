exports.auth = function (req, res, next) {
	// var https = require('https');
	// // var code = req.params.code;
	// code = '7c6712acbad591775154afd288061a04';
	// var meetup_key = '5gefnsti32oruqceedbl0q0jag';
	// var meetup_secret = 'ake993sske7re8q4a7qk05si0l';
	// var server_path = 'https://127.0.0.1:5000';
	// var options = {
	// 	hostname: 'https://secure.meetup.com',
	// 	port: 80,
	// 	path: '/oauth2/access?client_id=' + meetup_key + '&client_secret=' + meetup_secret + '&grant_type=authorization_code&redirect_uri=' + server_path + '&code=' + code,
	// 	method: 'POST'
	// }
	// https.request(options, function (res) {
	// 	console.log('STATUS: ' + res.statusCode);
	// 	console.log('HEADERS: ' + JSON.stringify(res.headers));
	// 	res.setEncoding('utf8');
	// 	res.on('data', function (chunk) {
	// 		console.log('BODY: ' + chunk);
	// 	});
	// 	res.send(res);
	// }, function (res) {});
	var OAuth = require('oauth');
	var OAuth2 = OAuth.OAuth2;
	var code = req.params.code;
	var meetup_key = '5gefnsti32oruqceedbl0q0jag';
	var meetup_secret = 'ake993sske7re8q4a7qk05si0l';
	var server_path = 'https://127.0.0.1:5000';
	var oauth2 = new OAuth2(meetup_key,
		meetup_secret,
		'https://127.0.0.1:5000',
		null,
		'oauth2/token',
		null);
	oauth2.getOAuthAccessToken(
		'', {
			'grant_type': 'authorization_code'
		},
		function (e, access_token, refresh_token, results) {
			console.log('bearer: ', e);
		});
};