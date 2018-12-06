var express = require('express');
var router = express.Router();
var AWS = require('./aws-environment');
AWS.init();

router.get('/', function(req, res, next) {
	var scan = { 
		TableName: "WindowContent", 
		ExpressionAttributeNames: {"#F": "File"}, 
		ProjectionExpression: "#F, FileName, WindowName" 
	};
	AWS.dynamodb.scan(scan, function(err, data) {
		if (err) { 
			res.send(JSON.parse('{"status": "error", "description": "internal database error"}'));
		} else {
			var resp = [];
			for(var i = 0; i < data.Items.length; i++) {
				var item = {};
				item.WindowName = data.Items[i].WindowName.S;
				item.File = data.Items[i].File.S;
				item.FileName = data.Items[i].FileName.S;
				resp.push(item);
			}
			res.send(resp);
		}
		res.end();
	});
});

module.exports = router;
