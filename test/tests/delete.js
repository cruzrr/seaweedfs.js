var fs = require("fs");
var weedfs = require("../../index.js");
var expect = require('chai').expect;

var config = require("../testconf");
var client = new weedfs(config);

var testFileBytes = 280072;

var stream = require('stream');
var util = require('util');

describe("seaweed delete api", function () {
    it("should write a single file as Buffer and delete it", function (done) {
        var fileInfo;
        client.write(new Buffer("atroo")).then(function (finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");
            expect(fileInfo.fid).to.be.a("string");
            expect(fileInfo.publicUrl).to.be.a("string");
            expect(fileInfo.url).to.be.a("string");
            return client.read(fileInfo.fid);
        }).then(function (buffer) {
            expect(buffer.toString("utf8")).to.equal("atroo");
            return client.remove(fileInfo.fid);
        }).then(function (res) {
			console.log(res);
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function (err) {
            console.log(err);
        });
    });

});