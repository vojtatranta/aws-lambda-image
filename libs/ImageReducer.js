const ImageData = require('./ImageData')
const Mozjpeg = require('./optimizers/Mozjpeg')
const Pngquant = require('./optimizers/Pngquant')
const Pngout = require('./optimizers/Pngout')
const ReadableStream = require('./ReadableImageStream')
const StreamChain = require('./StreamChain')

/**
 * Image Reducer
 * Accept png/jpeg typed image
 *
 * @constructor
 * @param Object option
 */
function ImageReducer(option) {
  this.option = option || {}
}

/**
 * Execute process
 *
 * @public
 * @param ImageData image
 * @return Promise
 */
ImageReducer.prototype.exec = function ImageReducer_exec(image) {
  const option = this.option

  return new Promise(((resolve, reject) => {
    const input = new ReadableStream(image.getData())
    const streams = this.createReduceStreams(image.getType())
    const chain = new StreamChain(input)

    chain.pipes(streams).run()
      .then((buffer) => {
        let dir = option.directory || image.getDirName()

        if (dir) {
          dir = `${dir.replace(/\/$/, '')}/`
        }

        resolve(new ImageData(
          dir + image.getFileName(),
          option.bucket || image.bucketName,
          buffer,
          image.datetime,
          image.getHeaders(),
          image.getFileName()
        ))
      })
      .catch((message) => {
        reject(message)
      })
  }))
}

/**
 * Create reduce image streams
 *
 * @protected
 * @param String type
 * @return Array<ChildProcess>
 * @thorws Error
 */
ImageReducer.prototype.createReduceStreams = function ImageReducer_createReduceStreams(type) {
  const streams = []

  switch (type.toLowerCase()) {
    case 'png':
      streams.push((new Pngquant()).spawnProcess())
      streams.push((new Pngout()).spawnProcess())
      break
    case 'jpg':
    case 'jpeg':
      streams.push((new Mozjpeg()).spawnProcess())
      break
    default:
      throw new Error('Unexcepted file type.')
  }

  return streams
}

module.exports = ImageReducer
