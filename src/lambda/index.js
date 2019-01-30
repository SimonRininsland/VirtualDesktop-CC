// PACKAGES
var util        = require('util');
var async       = require('async');
var AWS         = require('aws-sdk');
var gm          = require('gm').subClass({ imageMagick: true });
var s3          = new AWS.S3();
// MaxWITDTH and HEIGHT
var MAX_WIDTH   = 320;
var MAX_HEIGHT  = 180;
 
exports.handler = function(event, context, callback) {
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    // remove UniCodes
    var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
    // custom BucketName
    var dstBucket = "thumbs"+srcBucket;
    // make destination and src key the same
    var dstKey    = srcKey;
    // Image type
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        callback("Could not determine the image type.");
        return;
    }
    // allow image types
    if (typeMatch[1] != "jpg" && typeMatch[1] != "png" && typeMatch[1] != "jpeg") {
        callback('Unsupported image type: ${typeMatch[1]}');
        return;
    }
    // S3 Bucket WaterFall
    async.waterfall([
        function download(next) {
            // S3 Bucket Download
            s3.getObject({
                    Bucket: srcBucket,
                    Key: srcKey
                }, next);
            },
        function transform(response, next) {
            gm(response.Body).size(function(err, size) {
                // Scaling Factor
                var scalingFactor = Math.min(
                    MAX_WIDTH / size.width,
                    MAX_HEIGHT / size.height
                );

                // Scale images
                this.resize(scalingFactor * size.width, scalingFactor * size.height)
                    .toBuffer(typeMatch[1], function(err, buffer) {
                        if (err) next(err);
                        else next(null, response.ContentType, buffer);
                    });
            });
        },
        function upload(contentType, data, next) {
            // Bucket Stream
            s3.putObject({
                    Bucket: dstBucket,
                    Key: dstKey,
                    Body: data,
                    ContentType: contentType
                }, next);
            }
        ], function (err) {
            //Write Error Log in Lambda Console
            if (err) {
                console.error('Unable to resize ' + srcBucket + '/' + srcKey + ' and upload to ' + dstBucket + '/' + dstKey + ' due to an error: ' + err);
            } else {
                console.log('Successfully resized ' + srcBucket + '/' + srcKey + ' and uploaded to ' + dstBucket + '/' + dstKey);
            }
            callback(null, "message");
        }
    );
};