var fs		= require("fs");
var weedfs 	= require("../../index.js");
var assert 	= require("assert");

var config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var client = new weedfs(config);

client.systemStatus(function(err, status) {
	assert.ok(status, !null);
});
