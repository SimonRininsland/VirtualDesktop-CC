aws lambda add-permission --function-name CreateThumbnail --principal s3.amazonaws.com --statement-id lambda --action "lambda:InvokeFunction" --source-arn arn:aws:s3:::filebucketvirtualdesktop --source-account 737248450844