var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
var VD = require('./virtual-desktop');
var Busboy = require('busboy');
AWS.init();

router.post('/', function(req, res, next) {
	AWS.cognito.validate(req.cookies.token, function(err, auth) {
		if(err) {
			res.send({"status": "error", "description": "authentification failed"});
		} else {
			var fields = {};
			busboy = new Busboy({ headers: req.headers });
			busboy.on('field', function (key, value) {
				fields[key] = value;
			});
			busboy.on('file', function (key, file, name) {
				VD.addFile(auth.username, fields.windowName, name, file, function(reply) {
					res.send(reply);
					res.end();
				});
			});
			busboy.on('error', function (err) {
				console.log(err);
				next();
			});
			busboy.on('finish', function () {
				next();
			});
			req.pipe(busboy);
		}
	});
}, [()=>{}]);

module.exports = router;