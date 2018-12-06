var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
AWS.init();

router.get('/', function(req, res, next) {
	var del = { 
		TableName: "WindowContent", 
		Key: { 
			"File": {"S": req.query.name}, 
		}
	};
	if(req.query.name === undefined) {
		res.send(JSON.parse('{"status": "error", "description": "param \'name\' required"}'));
		res.end();
	} else {
		AWS.dynamodb.deleteItem(del, function(err, data) {
			if (err) { 
				res.send(JSON.parse('{"status": "error", "description": "internal database error"}'));
			} else { 
				res.send(JSON.parse('{"status": "ok"}'));
			}
			res.end();
		});
	}
});

module.exports = router;
