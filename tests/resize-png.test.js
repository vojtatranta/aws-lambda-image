var resize = require("../libs/ImageResizer");
var ImageData    = require("../libs/ImageData");
var ImageMagick  = require("imagemagick");

var expect     = require("chai").expect;
var fs         = require("fs");
var path       = require("path");
var destPath   = path.join(__dirname, "/fixture/fixture_resized.png");

describe("Resize PNG Test", function() {

    it("Resize PNG", function(done) {
        var image = new ImageData(
            "fixture/fixture.png",
            "fixture",
            fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"})
        );

        resize(200, image)
        .then(function(resized) {
            fs.writeFileSync(destPath, resized.getData(), {encoding: "binary"});
            ImageMagick.identify(["-format", "%w", destPath], function(err, out) {
                if ( err ) {
                    expect.fail();
                } else {
                    expect(parseInt(out, 10)).to.equal(200);
                }
                fs.unlinkSync(destPath);
                done();
            });
        });

    });
});
