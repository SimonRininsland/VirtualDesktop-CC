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
			VD.getFile(auth.username, req.query.windowName, req.query.fileName, function(reply) {
				if(reply.status === 'error') {
					res.send(reply);
					res.end();
				} else {
					res.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Length": reply.data.length, "Content-Disposition": "attachment; filename=" + reply.data.fileName });
					res.end(reply.data.body);
				}
			});
		}
	});
});

module.exports = router;
