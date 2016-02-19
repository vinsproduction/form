
module.exports = function (app){

	app.all('/', function(req, res){
		res.render('index', { title: 'Express' });
	});

	app.all('/api/user/details', function(req, res){

		var data = { text: 'user details' };

		if(app.logData) console.log(data);
	  	res.json(data);

	  //res.send('text');
	});

};
