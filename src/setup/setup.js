var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: 'not-important',
    secretAccessKey: 'not-important',  
    region: 'local',
    endpoint: new AWS.Endpoint('http://localhost:8000')
});
var dynamodb = new AWS.DynamoDB();

var window = {
	BillingMode: "PAY_PER_REQUEST",
	AttributeDefinitions: [
		{
			AttributeName: "Window", 
			AttributeType: "S"
		}
	], 
	KeySchema: [
		{
			AttributeName: "Window", 
			KeyType: "HASH"
		}
	],
	ProvisionedThroughput: { 
		ReadCapacityUnits: 5,
		WriteCapacityUnits: 5
	},
	TableName: "Window"
};

var windowContent = {
	BillingMode: "PAY_PER_REQUEST",
	AttributeDefinitions: [
		{
			AttributeName: "File", 
			AttributeType: "S"
		}
	], 
	KeySchema: [
		{
			AttributeName: "File", 
			KeyType: "HASH"
		}
	],
	ProvisionedThroughput: { 
		ReadCapacityUnits: 5,
		WriteCapacityUnits: 5
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