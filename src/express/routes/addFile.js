var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
AWS.init();

router.post('/', function(req, res, next) {
	var object = {
		Body: req.files.file.data, 
		Bucket: "filebucketvirtualdesktop", 
		Key: req.files.file.md5()
	};
	AWS.s3.putObject(object, function(err, data) {
		if (err) console.log(err, err.stack);
		else console.log(data);
	});
	var put = { 
		TableName: "WindowContent", 
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
			res.send(JSON.parse('{"status": "ok"}'));
		}
		res.end();
	});
});

module.exports = router;
