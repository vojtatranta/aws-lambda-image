const WritableStream = require('./WritableImageStream')

/**
 * Strem Chain
 * Start input, pipes streams, and get output buffer
 *
 * @constructor
 * @param stream.Readable inputStream
 */
function StreamChain(inputStream) {
  this.inputStream = inputStream
  this.pipeStreams = []
}

/**
 * Static instantiate
 *
 * @public
 * @static
 * @param stream.Readable inputStream
 * @return StreamChain
 */
StreamChain.make = function (inputStream) {
  return new StreamChain(inputStream)
}

/**
 * Pipes stream lists
 *
 * @public
 * @param Array<ChildProcess> streams
 * @return StreamChain this
 */
StreamChain.prototype.pipes = function (streams) {
  let index = -1

  while (streams[++index]) {
    this.pipeStreams.push(streams[index])
  }

  return this
}

/**
 * Run the streams
 *
 * @public
 * @return Promise
 */
StreamChain.prototype.run = function () {
  this.inputStream.pause()

  return new Promise(((resolve, reject) => {
    const output = new WritableStream()
    let current

    this.inputStream.on('error', reject)
    current = this.inputStream

    this.pipeStreams.forEach((stream) => {
      stream.stderr.on('error', reject)
      current.pipe(stream.stdin)
      current = stream.stdout
    })

    current.pipe(output)
    output.on('error', reject)
    output.on('finish', () => {
      resolve(output.getBufferStack())
    })
    this.inputStream.resume()
  }))
}

module.exports = StreamChain
