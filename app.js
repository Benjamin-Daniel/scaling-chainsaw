require('dotenv').config();

const express = require('express'),
	port = process.env.PORT || '3001',
	path = require('path'),
	morgan = require('morgan'),
	bcrypt = require('bcrypt'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	mongoose = require('mongoose'),
	expressLayouts = require('express-ejs-layouts')
	app = express(),
	router = require('./app/routes'),
	Secret = process.env.SECRET;


mongoose.connect(process.env.DB_URI, { useMongoClient: true, }, function (err) {
	if (err) {
		return console.log(err);
	}

	return console.log("Succesfully connected to MongoDB");
});
// configure
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

// tell node where to find our static files
app.use(express.static(__dirname + '/public'));

//set ejs as our templating engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: Secret, resave: false, saveUninitialized: true }));
//set the routes
app.use(router);




// start the server
app.listen(port, function () {
	console.log(`app listening on http://loalhost:${port}`);
});

module.exports = app;
