var express = require('express');
var fs = require('fs');
var router = express.Router();
var AWS = require('./aws-environment');
var VD = require('./virtual-desktop');
AWS.init();

router.get('/', function(req, res, next) {
	AWS.cognito.validate(req.cookies.token, function(err, auth) {
		if(err) {
			res.send({"status": "error", "description": "authentification failed"});
		} else {
			if(req.headers.range) {
				VD.getFileHead(auth.username, req.query.windowName, req.query.fileName, function(reply1) {
					var fileSize = reply1.data.length;
					var range = req.headers.range;
					var parts = range.replace(/bytes=/, "").split("-");
					var start = parseInt(parts[0], 10);
					// var end = parts[1] ? parseInt(parts[1], 10) : fileSize-1
					var end = parts[1] ?  parseInt(parts[1], 10) : start + ~~(fileSize * 0.05)
					if(end > fileSize - 1) {
						var end = fileSize - 1;
					}
					var chunksize = (end - start) + 1;
					VD.getStream(auth.username, req.query.windowName, req.query.fileName, `bytes=${start}-${end}`, function(reply2) {
						var head = {
							'Content-Range': `bytes ${start}-${end}/${fileSize}`, 
							'Accept-Ranges': 'bytes', 
							'Content-Length': chunksize
						}
						res.writeHead(206, head);
						reply2.data.fileStream.pipe(res);
					});
				});	
			} else {
				VD.getFileHead(auth.username, req.query.windowName, req.query.fileName, function(reply1) {
					var fileSize = reply1.data.length;
					var start = 0;
					var end = fileSize - 1;
					VD.getStream(auth.username, req.query.windowName, req.query.fileName, `bytes=${start}-${end}`, function(reply2) {
						res.writeHead(200, { 'Content-Length': fileSize });
						reply2.data.fileStream.pipe(res);
					});
				});	
			}
		};
	});
});

module.exports = router;