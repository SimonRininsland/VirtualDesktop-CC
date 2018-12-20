var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
var VD = require('./virtual-desktop');
AWS.init();

router.get('/', function(req, res, next) {
	// Überprüfen des nutzer tokens (nutzer eingeloggt?).
	AWS.cognito.validate(req.cookies.token, function(err, auth) {
		if(err) {
			res.send({"status": "error", "description": "authentification failed"});
		} else {
			VD.addWindow(req.query.windowId, auth.username, function(reply) {
				res.send(reply);
				res.end();
			});
		}
	});
});

module.exports = router;