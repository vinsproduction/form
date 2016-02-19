

// node server

app = module.exports = function (port){

	var express = require('express')
	  , http 	= require('http')
	  , fs 		= require('fs')
	  , path 	= require('path');

	var app = express();

	app.set('port', port);

	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use('/', express.static(path.resolve( './')));

	app.use(express.logger('dev'));
	app.use(express.errorHandler());

	// app.use(function(req, res, next) {
	// 	res.header("Access-Control-Allow-Origin", "*");
	// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	// 	res.contentType('text/plain'); // For stupid ie
	// 	next();
	// });

	/* Routes */

	app.logData = true; // Логировать ответы с сервера

	var routes_dir = __dirname + '/routes';
	fs.readdirSync(routes_dir).forEach(function(file) {
	   if (file.substr(file.lastIndexOf('.') + 1) !== 'js') return;
	   require(routes_dir + '/' + file)(app);
	});


	/* Create server */

	http.createServer(app).listen(port, function(){
		console.log('\nSERVER listening on port ' + port + '\n');
	});

	return app;

}