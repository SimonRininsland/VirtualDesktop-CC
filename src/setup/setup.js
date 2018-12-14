var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: 'eu-central-1'
});
var dynamodb = new AWS.DynamoDB({endpoint: 'https://dynamodb.eu-central-1.amazonaws.com'});
var s3 = new AWS.S3({endpoint: 'https://s3.eu-central-1.amazonaws.com'});

var window = {
	AttributeDefinitions: [
		{
			AttributeName: "WindowId", 
			AttributeType: "S"
		}
	], 
	KeySchema: [
		{
			AttributeName: "WindowId", 
			KeyType: "HASH"
		}
	],
	ProvisionedThroughput: { 
		ReadCapacityUnits: 1,
		WriteCapacityUnits: 1
	},
	TableName: "Window"
};

var windowContent = {
	AttributeDefinitions: [
		{
			AttributeName: "FileId", 
			AttributeType: "S"
		}
	], 
	KeySchema: [
		{
			AttributeName: "FileId", 
			KeyType: "HASH"
		}
	],
	ProvisionedThroughput: { 
		ReadCapacityUnits: 1,
		WriteCapacityUnits: 1
	},
	TableName: "WindowContent"
};

dynamodb.createTable(window, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log("Success", data);
}); 

dynamodb.createTable(windowContent, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log("Success", data);
});

s3.createBucket({Bucket: "filebucketvirtualdesktop"}, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log(data);
});
 
// SNIPETS

/* dynamodb.listTables({}, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log(data);
}); */

/* dynamodb.createTable(listElements, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log("Success", data);
}); */

/* dynamodb.deleteTable({TableName: "ListElement"}, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log("Success", data);
}); */

/* dynamodb.putItem({TableName: "WindowContent", Item: { "File": { "S": "Hello World!" } }}, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log(data);
}) */

/* s3.createBucket({Bucket: "filebucketvirtualdesktop"}, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log(data);
}); */