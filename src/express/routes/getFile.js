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
			VD.getFile(req.query.fileId, function(reply) {
				if(reply.status === 'error') {
					res.send({"status": "error", "description": err.description});
					res.end();
				} else {
					res.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Disposition": "attachment; filename=" + reply.data.filename });
					res.end(reply.data.data);
				}
			});
			
		}
	});
});

module.exports = router;
