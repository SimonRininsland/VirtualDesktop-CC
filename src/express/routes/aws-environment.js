var AWS = require('aws-sdk');
var CognitoExpress = require("cognito-express")

module.exports = {
    init: function() {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    },
    dynamodb: new AWS.DynamoDB({endpoint: 'https://dynamodb.eu-central-1.amazonaws.com', region: 'eu-central-1'}),
    s3: new AWS.S3({endpoint: 'https://s3.eu-central-1.amazonaws.com', region: 'eu-central-1'}),
	cognito: new CognitoExpress({
		region: "eu-central-1",
		cognitoUserPoolId: "eu-central-1_LTo2PtYqb",
		tokenUse: "access",
		tokenExpiration: 3600000
	})
};
