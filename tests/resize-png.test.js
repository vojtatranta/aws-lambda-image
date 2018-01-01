const resize = require('../libs/ImageResizer')
const ImageData = require('../libs/ImageData')
const ImageMagick = require('imagemagick')

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

const destPath = path.join(__dirname, '/fixture/fixture_resized.png')

describe('Resize PNG Test', () => {
  it('Resize PNG', (done) => {
    const image = new ImageData(
      'fixture/fixture.png',
      'fixture',
      fs.readFileSync(path.join(__dirname, '/fixture/fixture.png'), { encoding: 'binary' })
    )

    resize(200, image)
      .then((resized) => {
        fs.writeFileSync(destPath, resized.getData(), { encoding: 'binary' })
        ImageMagick.identify([ '-format', '%w', destPath ], (err, out) => {
          if (err) {
            expect.fail()
          } else {
            expect(parseInt(out, 10)).to.equal(200)
          }
          fs.unlinkSync(destPath)
          done()
        })
      })
  })
})
