var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
AWS.init();

router.post('/', function(req, res, next) {
	AWS.cognito.validate(req.cookies.token, function(err, response) {
		if(err) {
			res.send(JSON.parse('{"status": "error", "description": "not authenticated"}'));
		} else { 
			var put = { 
				TableName: process.env.WINDOW_CONTENT, 
				Item: { 
					"File": {"S": req.files.file.md5()}, 
					"FileName": {"S": req.files.file.name}, 
					"WindowName": {"S": req.body.window} 
				}
			};
			AWS.dynamodb.putItem(put, function(err, data) {
				if (err) {
					console.log(err);					
					res.send(JSON.parse('{"status": "error", "description": "internal database error"}'));
				} else { 
					console.log(data);
					res.send(JSON.parse('{"status": "ok"}'));
				}
				res.end();
			});
			var object = {
				Body: req.files.file.data, 
				Bucket: process.env.BUCKET, 
				Key: req.files.file.md5()
			};
			AWS.s3.putObject(object, function(err, data) {
				if (err) console.log(err, err.stack);
				else console.log(data);
			});
		}
	});
});

module.exports = router;
