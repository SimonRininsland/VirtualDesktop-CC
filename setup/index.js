// Slice Args
var argv = process.argv.slice(2);

// aws libs and config
var AWS = require('aws-sdk');
var archiver = require('archiver');
var fs = require('fs');

if(argv[1] && argv[2]) {
	AWS.config.update({ accessKeyId: argv[1], secretAccessKey: argv[2], region: 'eu-central-1' });
}

var cloudformation = new AWS.CloudFormation({endpoint: 'https://cloudformation.eu-central-1.amazonaws.com'});
var s3 = new AWS.S3({endpoint: 'https://s3.eu-central-1.amazonaws.com'});
var bucketName = Date.now()+'tmpbucket';

// Setup
if(argv[0] == 'create' && argv[1] && argv[2] && argv[3]) {
	// src ZIP
	var srcArchive = archiver('zip', { zlib: { level: 9 } });
	var srcPassZip = new require('stream').PassThrough();
	srcArchive.on('error', function(err){ console.log(err); });
	srcArchive.pipe(srcPassZip);
	srcArchive.glob("**/*", {cwd: "../src/express/"});
	srcArchive.finalize();

	// lambda ZIP
	var lambdaArchive = archiver('zip', { zlib: { level: 9 } });
	var lambdaPassZip = new require('stream').PassThrough();
	lambdaArchive.on('error', function(err){ console.log(err); });
	lambdaArchive.pipe(lambdaPassZip);
	lambdaArchive.glob("**/*", {cwd: "../src/lambda/"});
	lambdaArchive.finalize();

	// Creating Stack
	console.log("creating bucket for code");
	s3.createBucket({ Bucket: bucketName }, function(err, data) {
		if(err) { console.log(err); } else {
			console.log("streaming code to code bucket while zipping");
			s3.upload({Bucket: bucketName, Key: 'ebs.zip', Body: srcPassZip}, function(err, data) {
				if(err) { console.log("test1");console.log(err);} else {
					s3.upload({Bucket: bucketName, Key: 'lambda.zip', Body: lambdaPassZip}, function(err, data) {
						if(err) {console.log("test2");console.log(err);} else {
							console.log("creating stack");
							// check if Domain is given
							if (argv[4]) {
								var cloudformationparams = {
									StackName: argv[3],
									Parameters: [ 
										{ ParameterKey: 'AwsAccessKeyId', ParameterValue: argv[1]},
										{ ParameterKey: 'AwsSecretAccessKey', ParameterValue: argv[2]},
										{ ParameterKey: 'CodeBucket', ParameterValue: bucketName},
										{ ParameterKey: 'DomainName', ParameterValue: argv[4]}
									],
									Capabilities: ['CAPABILITY_NAMED_IAM'],
									TemplateBody: require('fs').readFileSync('./template.yml', 'utf8')
								};
							} else {
								var cloudformationparams = {
									StackName: argv[3],
									Parameters: [ 
										{ ParameterKey: 'AwsAccessKeyId', ParameterValue: argv[1]},
										{ ParameterKey: 'AwsSecretAccessKey', ParameterValue: argv[2]},
										{ ParameterKey: 'CodeBucket', ParameterValue: bucketName}
									],
									Capabilities: ['CAPABILITY_NAMED_IAM'],
									TemplateBody: require('fs').readFileSync('./template-no-route.yml', 'utf8')
								};
							}
							cloudformation.createStack(cloudformationparams, function(err, data) {
								if(err) { console.log(err); } else {
									console.log('StackName: '+argv[3]);
									console.log('CodeBucket: '+bucketName);
									if (argv[4]) {
										console.log('Domain: '+argv[4]);
									}
									console.log('Stack is in creation: See aws cloudformation console for further information');
									console.log('https://eu-central-1.console.aws.amazon.com/cloudformation');
									console.log('To delete:');
									console.log('node index.js delete '+argv[1]+' '+argv[2]+' '+bucketName+' '+argv[3]+'');
								}
							});
						}
					});
				}
			});
		}
	});
} else if(argv[0] == 'delete' && argv[1] && argv[2] && argv[3] && argv[4])  {
	console.log("deleting stack");
	cloudformation.deleteStack({ StackName: argv[4] }, function(err, data) {
		console.log("deleting file in bucket");
		s3.deleteObject({ Bucket: argv[3], Key: 'ebs.zip' }, function(err, data) {
			if(err) { console.log(err); } else { 
				s3.deleteObject({ Bucket: argv[3], Key: 'lambda.zip' }, function(err, data) {
					if(err) { console.log(err); } else {
						console.log("deleting code bucket");
						s3.deleteBucket({ Bucket: argv[3] }, function(err, data) {
							if(err) { console.log(err); } else { 
								console.log("done");
							}
						});
					}
				});
			}
		});
	});
} else {
	console.log("Welcome to VirtualDesktop");
	console.log("");
	console.log("usage: (optional domain_name)");
	console.log("\tcreate <aws_key_id> <aws_access_key> <stack_name> [<domain_name>]\tto create a virtualdesktop stack");
	console.log("\tdelete <aws_key_id> <aws_access_key> <tmp_code_bucket_name> <stack_name>\tto delete a virtualdesktop stack");
	console.log("");
	console.log("where aws_key_id and aws_access_key are the aws credentials");
	console.log("tmp_code_bucket_name is a code bucket for ebs");
	console.log("stack_name is the name for the cloudformation stack");
	console.log("please note tmp_code_bucket_name and stack_name for deletion");
}