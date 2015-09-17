var fs = require("fs");
var weedfs = require("../../index.js");
var expect = require('chai').expect;

var config = require("../testconf");
var client = new weedfs(config);

var testFileBytes = 280072;

describe("seaweed find api",function() {
    it("should find a written file", function(done) {
        var fileInfo;
        client.write(new Buffer("atroo")).then(function (finfo) {
            fileInfo = finfo;
            expect(fileInfo).to.be.an("object");
            
            return client.find(fileInfo.fid);
        }).then(function (res) {
            expect(res.locations.length).to.be.greaterThan(0);
            return client.remove(fileInfo.fid);
        }).then(function (res) {
            expect(res).to.be.an("object");
            expect(res.count).to.be.greaterThan(0);
            done();
        }).catch(function(err) {
            console.log(err);
        });
        
    });
    
    it("should not find an unknown file", function(done) {
        var fileInfo;
        client.find("93,bla").then(function (res) {
        }).catch(function(err) {
            expect(err).to.be.an.instanceof(Error);
            done();
        });
        
    });
    
    
});
