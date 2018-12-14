var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
AWS.init();

function getFileNameByID(fileId) {
	return new Promise(function(resolve, reject) {
		try {
			var get = {
				"AttributesToGet": [ "FileName" ],
				"Key": { "FileId": { "S": fileId } },
				"TableName": process.env.WINDOW_CONTENT
			};
			AWS.dynamodb.getItem(get, function(err, data) {
				if(err) {
					resolve({"error": "ressource", "description": "failed to obtain filename from database", "data": err});
				} else {
					console.log(data);
					resolve(data);
				}
			});
		} catch (err) { 
			resolve({"error": "exception", "description": "failed to obtain filename from database", "data": err});
		}
	});
}

function getFileByID(fileId) {
	return new Promise(function(resolve, reject) {
		// if(fileId === undefined) resolve({"error": "parameterisation" "fileId is missing"});
		try {
			var get = {
				Bucket: process.env.BUCKET,
				Key: fileId
			};
			AWS.s3.getObject(get, function(err, data) {
				if(err) {
					resolve({"error": "ressource", "description": "failed to obtain file from storage", "data": err});
				} else {
					resolve(data);
				}
			});
		} catch (err) { 
			resolve({"error": "exception", "description": "failed to obtain file from storage", "data": err});
		}
	});
}

function getFile(fileID, callback) {
	var error = null;
	// Promise.all arbeitet die angegebenen (async-)funktionen parallel ab ...
	Promise.all([
		getFileByID(fileID), 
		getFileNameByID(fileID), 
	]).then(function(values) { // dann werden die rückgabewerte aus resolve() verarbeitet.
		values.forEach(function(value) { if(value.error) error = value; });
		if(error) {
			callback(error, null);
		} else {
			callback(null, values[0].Body, values[1].Item.FileName.S);
		}
	});
}

router.post('/', function(req, res, next) {
	// Überprüfen des nutzer tokens (nutzer eingeloggt?).
	AWS.cognito.validate(req.cookies.token, function(err, response) {
		if(err) {
			res.send({"status": "error", "description": "authentification failed"});
		} else {
			getFile(req.body.fileId, function(err, file, fileName) {
				if(err) {
					console.log(err);
					res.send({"status": "error", "description": err.description});
					res.end();
				} else {
					res.writeHead(200, {
						"Content-Type": "application/octet-stream",
						"Content-Disposition": "attachment; filename=" + fileName
					});
					res.end(file);
				}
			});
		}
	});
});

module.exports = router;
