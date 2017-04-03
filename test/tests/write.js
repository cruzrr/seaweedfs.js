var fs = require("fs");
var weedfs = require("../../index.js");
var expect = require('chai').expect;

var config = require("../testconf");
var client = new weedfs(config);

var testFileBytes = 280072;

describe("seaweed write api", function() {
    it("should write a single file from a path", function(done) {
        client.write("./test/tests/test.jpg").then(function(fileInfo) {
            expect(fileInfo).to.be.an("object");

            return client.remove(fileInfo.fid);
        }).then(function(res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function(err) {
            console.log(err);
        });

    });

    it("should write a single buffer", function(done) {
        var fileInfo;
        client.write(new Buffer("Hallo")).then(function(finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");

            return client.read(fileInfo.fid);
        }).then(function(buffer) {
            expect(buffer.toString("utf8")).to.equal("Hallo");
            return client.remove(fileInfo.fid);
        }).then(function(res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function(err) {
            console.log(err);
        });

    });

    it("should write a single stream", function(done) {
        var fileInfo;
        client.write(fs.createReadStream("./test/tests/test.jpg")).then(function(finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");

            return client.read(fileInfo.fid);
        }).then(function(buffer) {
            expect(buffer.length).to.equal(testFileBytes);
            return client.remove(fileInfo.fid);
        }).then(function(res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function(err) {
            console.log(err);
        });

    });

    it("should write two files from path as array", function(done) {
        client.write(["./test/tests/test.jpg", "./test/tests/test1.jpg"]).then(function(fileInfo) {
            expect(fileInfo).to.be.an("object");

            return client.remove(fileInfo.fid);
        }).then(function(res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function(err) {
            console.log(err);
        });

    });

    it("should write two buffers", function(done) {
        var fileInfo;
        client.write([new Buffer("Hallo"), new Buffer("Hallo2")]).then(function(finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");

            return client.read(fileInfo.fid);
        }).then(function(buffer) {
            expect(buffer.toString("utf8")).to.equal("Hallo");
            return client.remove(fileInfo.fid);
        }).then(function(res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function(err) {
            console.log(err);
        });

    });

    it("should write two streams", function(done) {
        var fileInfo;
        client.write([fs.createReadStream("./test/tests/test.jpg"), fs.createReadStream("./test/tests/test1.jpg")]).then(function(finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");

            return client.read(fileInfo.fid);
        }).then(function(buffer) {
            expect(buffer.length).to.equal(testFileBytes);
            return client.remove(fileInfo.fid);
        }).then(function(res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function(err) {
            console.log(err);
        });

    });

    it("should reject on invalid filepath", function(done) {
        client.write("./test/tests/test25.jpg").then(function(fileInfo) {
            return client.remove(fileInfo.fid);
        }).then(function(res) {}).catch(function(err) {
            expect(err).to.be.an.instanceof(Error);
            done();
        });

    });

    it("should reject the returned promise if host is not reachable", function(done) {
        this.timeout(10000);
        var wronglyConfiguredClient = new weedfs({
            host: "wonghost",
            port: 4000
        });

        wronglyConfiguredClient.write("./test/tests/test.jpg").catch(function(err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.code).to.equal("ENOTFOUND");
            done();
        });
    });
});
