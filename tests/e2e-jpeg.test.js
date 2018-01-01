const ImageProcessor = require('../libs/ImageProcessor')
const ImageData = require('../libs/ImageData')
const Config = require('../libs/Config')
const Promise = require('es6-promise').Promise
const S3 = require('../libs/S3')

const sinon = require('sinon')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

const sourceFile = path.join(__dirname, '/fixture/event_source.json')
const setting = JSON.parse(fs.readFileSync(sourceFile))

describe('Optimize JPEG Test', () => {
  let processor

  before(() => {
    sinon.stub(S3, 'getObject', () => {
      return new Promise(((resolve, reject) => {
        fs.readFile(path.join(__dirname, '/fixture/fixture.jpg'), { encoding: 'binary' }, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(new ImageData(
              setting.Records[0].s3.object.key,
              setting.Records[0].s3.bucket.name,
              data
            ))
          }
        })
      }))
    })
    sinon.stub(S3, 'putObjects', (images) => {
      return Promise.all(images.map((image) => {
        return image
      }))
    })
  })

  after(() => {
    S3.getObject.restore()
    S3.putObjects.restore()
  })

  beforeEach(() => {
    processor = new ImageProcessor(setting.Records[0].s3, {
      done() {},
      fail() {},
    })
  })

  it('Reduce JPEG with no configuration', (done) => {
    processor.run(new Config())
      .then((images) => {
        expect(images).to.have.length(1)
        const image = images.shift()
        const buf = fs.readFileSync(path.join(__dirname, '/fixture/fixture.jpg'), { encoding: 'binary' })

        expect(image.getBucketName()).to.equal('sourcebucket')
        expect(image.getFileName()).to.equal('HappyFace.jpg')
        expect(image.getData().length).to.be.above(0)
          .and.be.below(buf.length)
        done()
      })
      .catch((messages) => {
        expect.fail(messages)
        done()
      })
  })

  it('Reduce JPEG with bucket/directory configuration', (done) => {
    processor.run(new Config({
      reduce: {
        bucket: 'foo',
        directory: 'some',
      },
    }))
      .then((images) => {
        expect(images).to.have.length(1)
        const image = images.shift()
        const buf = fs.readFileSync(path.join(__dirname, '/fixture/fixture.jpg'), { encoding: 'binary' })

        expect(image.getBucketName()).to.equal('foo')
        expect(image.getFileName()).to.equal('some/HappyFace.jpg')
        expect(image.getData().length).to.be.above(0)
          .and.be.below(buf.length)
        done()
      })
      .catch((messages) => {
        expect.fail(messages)
        done()
      })
  })
})
