var fs		= require("fs");
var weedfs	= require("../../index.js");
var assert	= require("assert");

var config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var client = new weedfs(config);


fs.stat("./tests/test.jpg", function (err, stats) {
	client.write("./tests/test.jpg", function(err, fileInfo) {

		/* download test */

		client.read(fileInfo.fid, function(err, resp, body) {
			assert.ok(body.length, stats.size, "DL size mismatch.");
	
			client.remove(fileInfo.fid, function(err, resp, body) {
				assert.ok(resp.statusCode, 200)
			});
		});
	});
});

