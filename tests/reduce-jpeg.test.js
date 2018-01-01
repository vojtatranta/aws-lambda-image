const ImageReducer = require('../libs/ImageReducer')
const ImageData = require('../libs/ImageData')

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

const fixture = fs.readFileSync(path.join(__dirname, '/fixture/fixture.jpg'), { encoding: 'binary' })

describe('Reduce JPEG Test', () => {
  let reducer

  beforeEach(() => {
    reducer = new ImageReducer()
  })

  it('Reduce JPEG', (done) => {
    const image = new ImageData('fixture/fixture.jpg', 'fixture', fixture)

    reducer.exec(image)
      .then((reduced) => {
        expect(reduced.getData().length > 0).to.be.true
        expect(reduced.getData().length).to.be.below(fixture.length)
        done()
      })
  })
})
