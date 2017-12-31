var resize = require("./ImageResizer");
var ImageReducer = require("./ImageReducer");
var S3           = require("./S3");
var Promise      = require("es6-promise").Promise;
var request      = require('superagent');
var ImageData = require('./ImageData');

/**
 * Image processor
 * management resize/reduce image list by configration,
 * and pipe AWS Lambda's event/context
 *
 * @constructor
 * @param Object s3Object
 * @param Object context
 */
function ImageProcessor(s3Object) {
    this.s3Object = s3Object;
}

function promise(fn) {
    return new Promise(fn);
}

/**
 * Run the process
 *
 * @public
 * @param Config config
 */
ImageProcessor.prototype.run = function ImageProcessor_run(config) {
    // If object.size equals 0, stop process
    if ( this.s3Object.object.size === 0 ) {
        reject("Object size equal zero. Nothing to process.");
        return;
    }

    if ( ! config.get("bucket") ) {
        config.set("bucket", this.s3Object.bucket.name);
    }

    return S3.getObject(
        this.s3Object.bucket.name,
        this.s3Object.object.key
    )
    .then(function(imageData) {
        return this.processImage(imageData, config);
    }.bind(this))
    .then(function(results) {
        return S3.putObjects(results);
    });
};

ImageProcessor.prototype.processImage = function ImageProcessor_processImage(imageData, config) {
    var reduce      = config.get("reduce", {});
    var promiseList = config.get("resizes", []).filter(function(option) {
            return option.size && option.size > 0;
        }).map(function(option) {
            if ( ! option.bucket ) {
                option.bucket = config.get("bucket");
            }
            return this.execResizeImage(option, imageData);
        }.bind(this));

    if ( ! reduce.bucket ) {
        reduce.bucket = config.get("bucket");
    }

    return Promise.all(promiseList)
        .then(saveImages);
};


function getURL(bucket, original) {
    return 'https://' + bucket + '.s3.eu-central-1.amazonaws.com/' + original;
}

function saveImages(images) {
    return sendToDB(images.map(function(image) {
        return prepareForDB(image)
    })).then(function() {
        return images
    });
}

function prepareForDB(image) {
    return {
        original: image.original,
        thumb: image.getFileName(),
        datetime: image.datetime,
        usergroup: 1,
        url: getURL(image.getBucketName(), image.original),
        width: image.width
    };
}

function getApiURL() {
    if (process.env.NODE_ENV == 'debug') {
        return 'http://localhost:3333/add';
    } else {
        return 'https://fotky.tabornadvorku.cz/add';
    }
}

function sendToDB(images) {
    return promise(function(resolve, reject) {
        request.post(getApiURL())
        .send(images)
        .end(function(err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(images);
            }
        });
    });
}

/**
 * Execute resize image
 *
 * @public
 * @param Object option
 * @param imageData imageData
 * @return Promise
 */
ImageProcessor.prototype.execResizeImage = function ImageProcessor_execResizeImage(option, imageData) {

    return resize(option.size, imageData)
    .then(function(resizedImage) {
        var dir = option.directory || resizedImage.getDirName();

        if ( dir ) {
            dir = dir.replace(/\/$/, "") + "/";
        }
        resizedImage.fileName = dir + resizedImage.getFileName();
        return resizedImage;
    });
};

/**
 * Execute reduce image
 *
 * @public
 * @param Object option
 * @param ImageData imageData
 * @return Promise
 */
ImageProcessor.prototype.execReduceImage = function(option, imageData) {
    var reducer = new ImageReducer(option);

    return reducer.exec(imageData);
};

module.exports = ImageProcessor;
