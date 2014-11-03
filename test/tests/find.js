var fs		= require("fs");
var weedfs	= require("../../index.js");
var assert	= require("assert");

var config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var client = new weedfs(config);

client.write("./tests/test.jpg", function(err, fileInfo) {

	client.find(fileInfo.fid, function(pub, pri) {
		assert.ok(typeof pub, "array");
		assert.ok(typeof pri, "array");
	});

	client.remove(fileInfo.fid, function(err, resp, body) {
		assert.ok(resp.statusCode, 200);
	});
});

