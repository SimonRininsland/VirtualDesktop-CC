var argv = process.argv.slice(2);
// aws libs and config
var AWS = require('aws-sdk');
if(argv[1] && argv[2]) {
	AWS.config.update({ accessKeyId: argv[1], secretAccessKey: argv[2], region: 'eu-central-1' });
}
var cloudformation = new AWS.CloudFormation({endpoint: 'https://cloudformation.eu-central-1.amazonaws.com'});
var s3 = new AWS.S3({endpoint: 'https://s3.eu-central-1.amazonaws.com'});
// create, delete
if(argv[0] == 'create' && argv[1] && argv[2] && argv[3] && argv[4]) {
	var archiver = require('archiver');
	var archive = archiver('zip', { zlib: { level: 9 } });
	var passZip = new require('stream').PassThrough();
	archive.on('error', function(err){ console.log(err); });
	archive.pipe(passZip);
	archive.glob("**/*", {cwd: "../src/express/"});
	archive.finalize();
	console.log("creating bucket for code");
	s3.createBucket({ Bucket: argv[3] }, function(err, data) {
		if(err) { console.log(err); } else {
			console.log("streaming code to code bucket while zipping");
			s3.upload({Bucket: argv[3], Key: 'ebs.zip', Body: passZip}, function(err, data) {
				if(err) { console.log(err); } else {
					console.log("creating stack");
					var cloudformationparams = {
						StackName: argv[4],
						Parameters: [ 
							{ ParameterKey: 'AwsAccessKeyId', ParameterValue: argv[1]},
							{ ParameterKey: 'AwsSecretAccessKey', ParameterValue: argv[2]},
							{ ParameterKey: 'CodeBucket', ParameterValue: argv[3]}
						],
						TemplateBody: require('fs').readFileSync('./template.yml', 'utf8')
					};
					cloudformation.createStack(cloudformationparams, function(err, data) {
						if(err) { console.log(err); } else {
							console.log("stack is in creation: see aws cloudformation console for further information");
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
				console.log("deleting code bucket");
				s3.deleteBucket({ Bucket: argv[3] }, function(err, data) {
					if(err) { console.log(err); } else { 
						console.log("done");
					}
				});
			}
		});
	});
} else {
	console.log("Welcome to VirtualDesktop");
	console.log("");
	console.log("usage:");
	console.log("\tcreate <aws_key_id> <aws_access_key> <tmp_code_bucket_name> <stack_name>\tto create a virtualdesktop stack");
	console.log("\tdelete <aws_key_id> <aws_access_key> <tmp_code_bucket_name> <stack_name>\tto delete a virtualdesktop stack");
	console.log("");
	console.log("where aws_key_id and aws_access_key are the aws credentials");
	console.log("tmp_code_bucket_name is a code bucket for ebs");
	console.log("stack_name is the name for the cloudformation stack");
	console.log("please note tmp_code_bucket_name and stack_name for deletion");
}