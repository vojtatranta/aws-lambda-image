const ImageProcessor = require('./libs/ImageProcessor')
const Config = require('./libs/Config')
const processVideo = require('./libs/video')

const fs = require('fs')
const path = require('path')

function retry(maxRetries, promiseFn, context, args) {
  function createPromiseFromFn(onResolve, onReject) {
    return promiseFn.apply(context, args)
      .then(onResolve, onReject)
      .catch(onReject)
  }
  return new Promise(((resolve, reject) => {
    function onResolve(result) {
      return resolve(result)
    }

    let retries = 0
    function onReject(err) {
      retries++
      if (retries === maxRetries) {
        reject(err, 'Too many retries')
      } else {
        return createPromiseFromFn(onResolve, onReject)
      }
    }

    createPromiseFromFn(onResolve, onReject)
  }))
}

// Lambda Handler
exports.handler = function (event, context) {
  let s3Object = event.Records[0].s3
  if (event.Records[0].Sns) {
    s3Object = JSON.parse(event.Records[0].Sns.Message).Records[0].s3
  }

  let resultPromise = null
  if (/(mp4|mov)/.test(s3Object.object.key)) {
    resultPromise = retry(3, () => {
      return new Promise((resolve, reject) => {
        try {
          processVideo(s3Object)
        } catch (err) {
          reject(err)
        }
      })
    })
  } else {
    const configPath = path.resolve(__dirname, 'config.json')
    const processor = new ImageProcessor(s3Object)
    const config = new Config(JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' })))

    console.log('S3 OBJECT:', s3Object)
    resultPromise = retry(3, processor.run, processor, [ config ])
  }

  resultPromise
    .then((proceedImages) => {
      proceedImages.forEach((image) => {
        console.log(image)
      })
      context.succeed(`OK, numbers of ${proceedImages.length} images has proceeded.`)
    }, (err) => {
      context.fail(`Reject:${err}`)
    })
    .catch((messages) => {
      context.fail(`Woops, image process failed: ${messages}`)
    })
}
