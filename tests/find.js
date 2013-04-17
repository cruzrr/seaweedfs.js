var weedfs = require('../index.js');

var client = new weedfs({
	server:		"localhost",
	port:		"9333"
});

client.find('3,27193725f27d', function(flocation) {
	console.log(flocation);
});
