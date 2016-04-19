var ImageData   = require("./ImageData");

var Promise     = require("es6-promise").Promise;
var ImageMagick = require("imagemagick");
var ExifImage = require('exif').ExifImage;


var parseDateTime = function(exif) {
    var dt = exif['exif']['DateTimeOriginal'];
    if ((typeof dt !== "undefined" && dt !== null)) {
        var splitted = dt.split(' ');
        return [splitted[0].replace(':', '-').replace(':', '-'), splitted[1]].join(' ');
    } else {
        return null;
    }
};


var getImageDateTime = function(imgPath, cb) {
    try {
        return new ExifImage({image: imgPath}, function(error, exifData) {
            if (error || !(typeof exifData !== "undefined" && exifData !== null)) { return cb(null); }
            return cb(parseDateTime(exifData));
        });
    } catch (error) {
        return cb(null);
    }
};


/**
 * Execute resize
 *
 * @public
 * @param ImageData image
 * @return Promise
 */

module.exports = function ImageResizer_exec(width, image) {
    var params = {
        srcData:   image.getData().toString("binary"),
        srcFormat: image.getType().toLowerCase(),
        format:    image.getType().toLowerCase(),
        width:     width
    };

    return new Promise(function(resolve, reject) {
        ImageMagick.resize(params, function(err, stdout, stderr) {
            if ( err || stderr ) {
                reject("ImageMagick err" + (err || stderr));
            } else {
                getImageDateTime(image.data, function(datetime) {
                     resolve(new ImageData(
                        image.fileName,
                        image.bucketName,
                        stdout,
                        datetime,
                        image.getHeaders()
                    ));
                });

            }
        });
    });
};
