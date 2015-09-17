var fs = require("fs");
var weedfs = require("../../index.js");
var expect = require('chai').expect;

var config = require("../testconf");
var client = new weedfs(config);

var testFileBytes = 280072;

describe("seaweed status api",function() {
    it("should query the master server for the master server status", function(done) {
        client.masterStatus().then(function (status) {
            expect(status).to.be.an("object");
            expect(status.IsLeader).to.exist;
            expect(status.Leader).to.exist;
            done();
        }).catch(function(err) {
            console.log(err);
            done();
        });
        
    });
    
    it("should query the master server for the status of the infrastructure", function(done) {
        client.systemStatus().then(function (status) {
            expect(status).to.be.an("object");
            expect(status.Version).to.exist;
            expect(status.Topology).to.exist;
            expect(status.Topology.DataCenters).to.exist;
            expect(status.Topology.layouts).to.exist;
            done();
        }).catch(function(err) {
            console.log(err);
            done();
        });
        
    });
    
});
