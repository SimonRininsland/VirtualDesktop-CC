var express = require('express');
var router = express.Router();

var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: 'not-important',
    secretAccessKey: 'not-important',  
    region: 'local',
    endpoint: new AWS.Endpoint('http://localhost:8000')
});
var dynamodb = new AWS.DynamoDB();

router.get('/', function(req, res, next) {
	var put = { 
		TableName: "WindowContent", 
		Item: { 
			"File": {"S": req.query.name}, 
			"FileName": {"S": req.query.name}, 
			"WindowName": {"S": "HelloWindow"} 
		}
	};
	if(req.query.name === undefined) {
		res.send(JSON.parse('{"status": "error", "description": "param \'name\' required"}'));
		res.end();
	} else {
		dynamodb.putItem(put, function(err, data) {
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
