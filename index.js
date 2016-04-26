/**
 * Automatic Image resize, reduce with AWS Lambda
 * Lambda main handler
 *
 * @author Yoshiaki Sugimoto
 * @created 2015/10/29
 */
var ImageProcessor = require("./libs/ImageProcessor");
var Config         = require("./libs/Config");
var Promise     = require("es6-promise").Promise;

var fs   = require("fs");
var path = require("path");

function retry(maxRetries, promiseFn, context, args) {
    function createPromiseFromFn(onResolve, onReject) {
        return promiseFn.apply(context, args)
                .then(onResolve, onReject)
                .catch(onReject);
    }
    return new Promise(function(resolve, reject) {
        function onResolve(result) {
            return resolve(result);
        }

        var retries = 0;
        function onReject(err) {
            retries++;
            if (retries == maxRetries) {
                reject(err, 'Too many retries');
            } else {
                return createPromiseFromFn(onResolve, onReject);
            }
        }

        createPromiseFromFn(onResolve, onReject);
    });
}

// Lambda Handler
exports.handler = function(event, context) {
    var s3Object   = event.Records[0].s3;
    var configPath = path.resolve(__dirname, "config.json");
    var processor  = new ImageProcessor(s3Object);
    var config     = new Config(
        JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))
    );

    console.log(s3Object);
    retry(3, processor.run, processor, [ config ])
        .then(function(proceedImages) {
            proceedImages.forEach(function(image) {
                console.log(image);
            });
            context.succeed("OK, numbers of " + proceedImages.length + " images has proceeded.");
        }, function(err) {
            context.fail('Reject:' + err);
        })
        .catch(function(messages) {
            context.fail("Woops, image process failed: " + messages);
        });
};
