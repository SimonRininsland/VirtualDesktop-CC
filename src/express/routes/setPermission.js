var express = require('express');
var router = express.Router();
var busboySync = require('./busboySync');
var AWS = require('./aws-environment');
var VD = require('./virtual-desktop');
AWS.init();

router.use(busboySync);
router.post('/', function(req, res, next) {
	// Überprüfen des nutzer tokens (nutzer eingeloggt?).
	AWS.cognito.validate(req.cookies.token, function(err, auth) {
		if(err) {
			res.send({"status": "error", "description": "authentification failed"});
		} else {
			VD.setPermission(auth.username, req.body.forUser, req.body.windowName, JSON.parse(req.body.forUserPermissions), function(reply) {
				res.send(reply);
				res.end();
			});
		}
	});
});

module.exports = router;
