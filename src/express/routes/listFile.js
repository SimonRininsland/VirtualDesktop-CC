var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
AWS.init();

function listFileForWindow(windowId) {
	return new Promise(function(resolve, reject) {
		if(windowId === undefined) resolve({"error": "parameterisation", "description": "windowId is missing"});
		try {
			var scan = { 
				ExpressionAttributeValues: { ":wid": { S: windowId } }, 
				FilterExpression: "WindowId = :wid", 
				TableName: process.env.WINDOW_CONTENT, 
				ProjectionExpression: "FileId, FileName" 
			};
			AWS.dynamodb.scan(scan, function(err, data) {
				if(err) {
					resolve({"error": "ressource", "description": "failed to obtain file list from database", "data": err});
				} else {
					var list = [];
					data.Items.forEach(function(element) {
						var item = {};
						item.FileId = element.FileId.S;
						item.FileName = element.FileName.S;
						list.push(item);
					});
					resolve(list);
				}
			});
		} catch (err) {
			resolve({"error": "exception", "description": "failed to obtain file list from database", "data": err});
		}
	});
}

function listFile(windowId, callback) {
	var error = null;
	// Promise.all arbeitet die angegebenen (async-)funktionen parallel ab ...
	Promise.all([
		listFileForWindow(windowId), 
	]).then(function(values) { // dann werden die rückgabewerte aus resolve() verarbeitet.
		values.forEach(function(value) { if(value.error) error = value; });
		if(error) {
			callback(error, null);
			listFileErrorHandling(error);
		} else {
			callback(null, values[0]);
		}
	});
}

router.get('/', function(req, res, next) {
	// Überprüfen des nutzer tokens (nutzer eingeloggt?).
	AWS.cognito.validate(req.cookies.token, function(err, response) {
		if(err) {
			res.send({"status": "error", "description": "authentification failed"});
		} else {
			listFile(req.body.windowId, function(err, data) {
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
