var fs		= require("fs");
var weedfs	= require("../../index.js");
var assert	= require("assert");

var config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var client = new weedfs(config);
var files  = ["./tests/test.jpg", "./tests/test1.jpg"];

client.write(files, function(err, fileInfo) {

	assert.ok(fileInfo, !null);

	client.remove(fileInfo.fid, function(err, resp, body) {
		assert.ok(resp.statusCode, 200);
	});
});
