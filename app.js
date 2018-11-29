var http = require('http');
var express = require('express');
var bodyParser  = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var mongoose = require('mongoose');
var db = mongoose.connection;
var users = require('./models/user');

app.set('view engine', 'pug')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

db.on('error', console.error);
db.once('open', function() {
	console.log("Connected to database");
});

mongoose.connect('mongodb://localhost/project', {useNewUrlParser : true});

app.get('/', function(req, res) {
	var id = req.cookies.student_id;

	res.render('human-index', {student_id : id});
});

app.get('/natural', function(req, res) {
	var id = req.cookies.student_id;

	res.render('natural-index', {student_id : id});
});

app.get('/human', function(req, res) {
	var id = req.cookies.student_id;

	res.render('human-index', {student_id : id});
});

app.post('/register',function(req, res) {
	console.log("Register request: { student_id: " + req.body.student_id + ", password:", req.body.password + ", ... }");

	users.findOne({student_id: req.body.student_id}, function(err, result) {
		if(err != null) {
			res.send({result : "failed"});
			console.error("Database read failed");
			return;
		}

		if(result == null) {
			var student = new users({
				student_id: req.body.student_id,
				password: req.body.password,
				name: req.body.name,
				birth: req.body.birth,
				department: req.body.department
			});

			student.save(function(err) {
				if(err) {
					res.send({result : "failed"});
					console.error("Database write failed");
				} else {
					res.send({result : "success"});
					console.log("Registeration success");
				}
			});
		} else {
			res.send({result : "duplicate"});
			console.log("Registeration failed (Duplicated ID)");
		}
	});
});

app.post('/login',function(req, res) {
	console.log("Login request: { student_id: " + req.body.student_id + ", password:", req.body.password + " }");

	users.findOne( {$and:[{student_id: req.body.student_id}, {password: req.body.password}]}, function(err, result) {
		if(err != null) {
			console.error("Database access failed");
			return;
		}

		if(result != null) {
			res.cookie('student_id', result.student_id);
			res.send({result: "success", student_id: result.student_id});
			console.log("Login success");
		} else {
			res.send({result: "failed"});
			console.log("Login failed");
		}
	});
});

app.post('/logout',function(req, res) {
	var id = req.cookies.student_id;
	console.log("Logout request: { student_id: " + id + " }");
	res.cookie('student_id', '');
	res.send();
	console.log("Logout success");
});

app.listen(8000, function() {
	console.log("Server ready (port: 8000)");
});
