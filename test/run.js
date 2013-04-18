var spawn	= require("child_process").spawn;
var fs		= require("fs");
var exitCode	= 0;
var timeout	= 10000;
var hr		= "##################################################";
var check	= "\033[32m\u2713\033[39m";
var cross	= "\033[31m\u2716\033[39m";

fs.readdir(__dirname + "/tests", function(err, files) {
	if (err) throw err;

	var tests = files.filter(function(f) {
		if (!f.match(".jpg")) {
			return f;
		}
	});

	var next = function() {
		if (tests.length === 0) {
			console.log("\n"+hr);
			console.log("Testing successfully completed.");
			console.log(hr+"\n");
			console.log("Thanks for using node-weedfs,");
			console.log("<3 @Dark_Aaron\n");

			process.exit(exitCode);
		}

		var file = tests.shift();
		process.stdout.write(file);

		var padding = 44 - file.length;

		for (var i = 0; i < padding; i++) {
			process.stdout.write(" ");
		}

		var proc = spawn("node", [ __dirname + "/tests/" + file, __dirname + "/testconf.json"]);

		var killed = false;
		var timer  = setTimeout(function() {
			proc.kill();
			exitCode += 1;
			console.log(cross + " Fail");
			console.error("Timed out...");
			killed = true;
		}, timeout);

		proc.stdout.pipe(process.stdout);
		proc.stderr.pipe(process.stderr);

		proc.on("exit", function(code) {
			if (code && !killed) console.log(cross + " Fail");
			exitCode += code || 0;
			clearTimeout(timer);

			if (!code && !killed) console.log(check + " Pass");
			next();
		});
	}

	console.log(hr);
	console.log("Starting node-weedfs tests...");
	console.log(hr + "\n");

	next();
});

