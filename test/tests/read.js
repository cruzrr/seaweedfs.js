var fs = require("fs");
var weedfs = require("../../index.js");
var expect = require('chai').expect;

var config = require("../testconf");
var client = new weedfs(config);

var testFileBytes = 280072;

var stream = require('stream');
var util = require('util');

describe("seaweed read api", function () {
    it("should read a single file as Buffer", function (done) {
        var fileInfo;
        client.write(new Buffer("atroo")).then(function (finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");
            return client.read(fileInfo.fid);
        }).then(function (buffer) {
            expect(buffer.toString("utf8")).to.equal("atroo");
            return client.remove(fileInfo.fid);
        }).then(function (res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function (err) {
            console.log(err);
        });
    });

    it("should read a single file as stream", function (done) {
        var fileInfo;

        var tmpBuffer = [];
        var resolveFunc;

        //create own stream class on the fly to have a stream to write to
        function EchoStream() { // step 2
            stream.Writable.call(this);
        };
        util.inherits(EchoStream, stream.Writable); // step 1
        EchoStream.prototype._write = function (chunk, encoding, done) { // step 3
            tmpBuffer.push(chunk);
            done();
        };
        EchoStream.prototype.end = function (buf) {
            if (buf) this.write(buf);
            var buffer = Buffer.concat(tmpBuffer);
            expect(buffer.toString("utf8")).to.equal("atroo");
            client.remove(fileInfo.fid).then(function (res) {
                expect(res).to.be.an("object");
                expect(res.count).to.be.greaterThan(0);
                done();
            }).catch(function (err) {
                console.log(err);
            });
        };

        client.write(new Buffer("atroo")).then(function (finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");
            return client.read(fileInfo.fid, new EchoStream());
        }).catch(function (err) {
            console.log(err);
        });
    });

    it("should not find an unknown file during read", function(done) {
        var fileInfo;
        client.read("93,bla").then(function (res) {
        }).catch(function(err) {
            expect(err).to.be.an.instanceof(Error);
            done();
        });

    });

});
