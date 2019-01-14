git archive -o ./bin/ebs.zip --format=zip HEAD ./src/express
aws s3 cp ./bin/ebs.zip s3://bucket/