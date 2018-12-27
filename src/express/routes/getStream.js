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
			VD.getFileHead(auth.username, req.query.windowName, req.query.fileName, function(reply) {
				var range = req.headers.range;
				var parts = range.replace(/bytes=/, "").split("-");
				var start = parseInt(parts[0], 10);
				if(!parts[1]) {
					var end = 1000;
					var chunksize = 1000;
					/*var end = reply.data.length - 1
					var chunksize = (end - start) + 1;*/
				} else {
					var end = parseInt(parts[1], 10);
					var chunksize = (end - start) + 1;
				}
				VD.getStream(auth.username, req.query.windowName, req.query.fileName, `bytes ${start}-${end}`, function(reply) {
					var fileSize = reply.data.length;
					var head = {'Content-Range': `bytes ${start}-${end}/${fileSize}`, "Content-Disposition": "attachment; filename=" + req.query.fileName, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4'}
					res.writeHead(206, head);
					reply.data.fileStream.pipe(res);
				});
				console.log("XXX start", start, "end", end, "chunksize", chunksize, "parts", parts, "range", range);
			});			
		};
	});
});

module.exports = router;