# VirtualDesktop-CC

## Project
Full stack is build with CloudFormation. 

## Requirements
- NodeJS / npm: https://nodejs.org/en/download/
- ```cd setup```
- AWS SDK: ```npm install aws-sdk archiver fs```

## Deployment
- trigger build: ```node index.js create <aws_key_id> <aws_access_key> <tmp_code_bucket_name> <stack_name>```
- trigger delete: ```node index.js delete <aws_key_id> <aws_access_key> <tmp_code_bucket_name> <stack_name>```