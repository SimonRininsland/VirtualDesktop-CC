var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
AWS.init();

function putWindowContentDynamoDB(fileId, fileName, windowId) {
	return new Promise(function(resolve, reject) {
		try {
			var put = { 
				// TODO: environment variablen cachen.
				TableName: process.env.WINDOW_CONTENT, 
				Item: { 
					"FileId": {"S": fileId}, 
					"FileName": {"S": fileName}, 
					"WindowId": {"S": windowId} 
				}
			};
			AWS.dynamodb.putItem(put, function(err, data) {
				if(err) {
					resolve({"error": "ressource", "description": "failed putting data into database", "data": err});
				} else {
					resolve(data);
				}
			});
		} catch (err) {
			resolve({"error": "exception", "description": "failed putting data into database", "data": err});
		}
	});
}

function putFileInS3Bucket(fileId, data) {
	return new Promise(function(resolve, reject) {
		try {
			var put = {
				Body: data, 
				Bucket: process.env.BUCKET, 
				Key: fileId
			};
			AWS.s3.putObject(put, function(err, data) {
				if(err) {
					resolve({"error": "ressource", "description": "failed putting data into storage", "data": err});
				} else {
					resolve(data);
				}
			});
		} catch (err) {
			resolve({"error": "exception", "description": "failed putting data into storage", "data": err});
		}
	});
}

function addFile(fileId, data, fileName, windowId, callback) {
	var error = null;
	// Promise.all arbeitet die angegebenen (async-)funktionen parallel ab ...
	Promise.all([
		putFileInS3Bucket(fileId, data), 
		putWindowContentDynamoDB(fileId, fileName, windowId)
	]).then(function(values) { // dann werden die rückgabewerte aus resolve() verarbeitet.
		values.forEach(function(value) { if(value.error) error = value; });
		if(error) {
			callback(error, null);
		} else {
			callback(null, null);
		}
	});
}

router.post('/', function(req, res, next) {
	// Überprüfen des nutzer tokens (nutzer eingeloggt?).
	AWS.cognito.validate(req.cookies.token, function(err, response) {
		if(err) {
			res.send({"status": "error", "description": "authentification failed"});
		} else {
			// TODO: bessere id (weil md5 nicht eindeutig genug)
			addFile(req.files.file.md5(), req.files.file.data, req.files.file.name, req.body.windowId, function(err, data) {
				if(err) {
					console.log(err);
					res.send({"status": "error", "description": err.description});
					res.end();
				} else {
					res.send({"status": "ok", "data": data});
					res.end();
				}
			});
		}
	});
});

module.exports = router;