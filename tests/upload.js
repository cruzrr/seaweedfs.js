var weedfs = require('../index.js');

var client = new weedfs({
	server:		"localhost",
	port:		"9333"
});

client.write(__dirname+"/test.png", function(finfo) {
	console.log(finfo);
});
