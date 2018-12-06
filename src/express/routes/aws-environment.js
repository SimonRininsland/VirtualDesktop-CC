var AWS = require('aws-sdk');

module.exports = {
    init: function() {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'eu-central-1'
        });
    },
    dynamodb: new AWS.DynamoDB({endpoint: 'https://dynamodb.eu-central-1.amazonaws.com'}),
    s3: new AWS.S3({endpoint: 'https://s3-eu-central-1.amazonaws.com'})
};
