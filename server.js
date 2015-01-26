var express = require('express'),
	https = require('https'),
	http = require('http'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	sessions = require('./routes/sessions'),
	speakers = require('./routes/speakers'),
	meetup = require('./routes/meetup'),
	app = express();

app.use(bodyParser()); // pull information from html in POST
app.use(methodOverride()); // simulate DELETE and PUT

app.use(express.static('static'));

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.get('/sessions', sessions.findAll);
app.get('/sessions/:id', sessions.findById);
app.get('/speakers', speakers.findAll);
app.get('/speakers/:id', speakers.findById);
app.get('/auth/meetup/:code', meetup.auth);
app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});