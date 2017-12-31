var ImageData = require("./ImageData");

var aws     = require("aws-sdk");
var Promise = require("es6-promise").Promise;
var client  = new aws.S3({signatureVersion: 'v4', region: 'eu-central-1'});

/**
 * Get object data from S3 bucket
 *
 * @param String bucket
 * @param String key
 * @return Promise
 */
function getObject(bucket, key) {
    return new Promise(function(resolve, reject) {
        client.getObject({ Bucket: bucket, Key: key }, function(err, data) {
            if ( err ) {
                reject("S3 getObject failed: " + err);
            } else {
                if ("img-processed" in data.Metadata) {
                    reject("Object was already processed.");
                    return;
                }

                resolve(new ImageData(key, bucket, data.Body, null, { ContentType: data.ContentType, CacheControl: data.CacheControl }));
            }
        });
    });
}

function getMime(contentType) {
    if (!contentType || contentType === 'application/octet-stream') {
        return 'image/jpeg'
    }

    return contentType
}

/**
 * Put object data to S3 bucket
 *
 * @param String bucket
 * @param String key
 * @param Buffer buffer
 * @return Promise
 */
function putObject(bucket, key, buffer, headers) {
    return new Promise(function(resolve, reject) {
        client.putObject({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            Metadata: {"img-processed": "true"},
            ContentType: getMime(headers.ContentType),
            CacheControl: headers.CacheControl || 'max-age=200000000, public',
        }, function(err) {
            if ( err ) {
                reject(err);
            } else {
                resolve("S3 putObject sucess");
            }
        });
    });
}

/**
 * Put objects data to S3 bucket
 *
 * @param Array<ImageData> images
 * @return Promise.all
 */
function putObjects(images) {
    promises = images.map(function(image) {
        return new Promise(function(resolve, reject) {
            putObject(image.getBucketName(), image.getFileName(), image.getData(), image.getHeaders())
            .then(function() {
                resolve(image);
            })
            .catch(function(message) {
                reject(message);
            });
        });
    });

    return Promise.all(promises);
}

module.exports = {
    getObject: getObject,
    putObject: putObject,
    putObjects: putObjects
};



