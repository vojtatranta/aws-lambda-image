const saveImages = require('./api')
const ImageData = require('./ImageData')

module.exports = (s3Object) => {
  const { object, bucket } = s3Object
  const image = new ImageData(object.key, bucket.name, '', (new Date()).toISOString().substring(0, 10), {}, object.key, 400, 'video')
  return saveImages([ image ])
}
