const ImageData = require('./ImageData')

const ExifImage = require('exif').ExifImage
const gm = require('gm').subClass({ imageMagick: true })


const parseDateTime = function (exif) {
  const dt = exif['exif']['DateTimeOriginal']
  if ((typeof dt !== 'undefined' && dt !== null)) {
    const splitted = dt.split(' ')
    return [ splitted[0].replace(':', '-').replace(':', '-'), splitted[1] ].join(' ')
  }
  return null
}


const getImageDateTime = function (imgPath, cb) {
  try {
    return new ExifImage({ image: imgPath }, ((error, exifData) => {
      if (error || !(typeof exifData !== 'undefined' && exifData !== null)) { return cb(null) }
      return cb(parseDateTime(exifData))
    }))
  } catch (error) {
    return cb(null)
  }
}


/**
 * Execute resize
 *
 * @public
 * @param ImageData image
 * @return Promise
 */


module.exports = function ImageResizer_exec(width, image) {
  return new Promise(((resolve, reject) => {
    gm(image.data)
      .autoOrient()
      .interlace('Line')
      .type('optimize')
      .compress('JPEG')
      .gravity('Center')
      .resize(width)
      .toBuffer('JPG', (err, stdout) => {
        if (err) {
          reject(new Error(`ImageMagick err${err}`))
        } else {
          getImageDateTime(image.data, (datetime) => {
            resolve(new ImageData(
              image.fileName,
              image.bucketName,
              stdout,
              datetime,
              image.getHeaders(),
              image.getFileName(),
              width
            ))
          })
        }
      })
  }))
}
