# VirtualDesktop-CC

## Project
Full stack is build with CloudFormation. 

## Requirements
- NodeJS / npm: https://nodejs.org/en/download/
- ```cd setup```
- AWS SDK: ```npm install aws-sdk archiver fs```

## Deployment
- Domain Name without www e.x. ```google.com```
- trigger build: ```node index.js create <aws_key_id> <aws_access_key> <stack_name> <domainName>```
The Build Script echos the delete command like:
- trigger delete: ```node index.js delete <aws_key_id> <aws_access_key> <tmp_code_bucket_name> <stack_name>```