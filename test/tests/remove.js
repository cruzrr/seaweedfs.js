var fs		= require("fs");
var weedfs	= require("../../index.js");
var assert	= require("assert");

var config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var client = new weedfs(config);

client.write("./tests/test.jpg", function(err, fileInfo) {
	client.remove(fileInfo.fid, function(err, resp, body) {
		var jsr = JSON.parse(body);


		assert.ok(!0, jsr.size);
	});
});
