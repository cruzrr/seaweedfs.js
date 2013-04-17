/*
 * node-weedfs: weed-fs client library
 *
 * Written by Aaron Blakely <aaron@cruzrr.com>
 * Maintained at cruzrr.  (http://cruzrr.com)
 *
 */

var fs		= require('fs');
var path	= require('path');

function WeedFSClient(opts) {
	this.http		= opts.client || require("request");
	this.clientOpts		= opts || {};

	this.baseURL = "http://"+this.clientOpts.server + ":" + this.clientOpts.port + "/";
}

WeedFSClient.prototype = {
	request: function(client) {
		this.http = client;
	},

	_assign: function(cb) {
		this.http(this.baseURL + "dir/assign", function(err, resp, body) {
			if (!err) {
				cb(JSON.parse(body));
			} else {
				throw err;
			}
		});
	},

	write: function(file, cb) {
		var ins = this;
		file    = path.resolve(process.cwd(), file);

		this._assign(function(finfo) {
			if (finfo.error) {
				throw new Error(finfo.error);
			}

			var req = ins.http.post("http://"+finfo.url+"/"+finfo.fid, function() {
				cb(finfo);
			});

			var writeForm = req.form();
			writeForm.append("file", fs.createReadStream(file));			
		});
	},

	find: function(fid, cb) {
		var volume = fid.split(',')[0];

		this.http(this.baseURL + "dir/lookup?volumeId=" + volume, function(err, resp, body) {
			var jsonresp = JSON.parse(body);

			var publocations = [];
			var srvlocations = [];

			for (var i in jsonresp.locations) {
				publocations.push("http://"+jsonresp.locations[i].publicUrl+"/"+fid);
				srvlocations.push("http://"+jsonresp.locations[i].url+"/"+fid);
			}

			cb(publocations, srvlocations);
		});
	},

	read: function(fid, stream, cb) {
		var ins = this;
		if ((typeof stream == "function") && !cb) {
			cb     = stream;
			stream = false;
		}

		this.find(fid, function(pub) {
			if (stream) {
				ins.http(pub[0]).pipe(stream);
			} else {
				ins.http(pub[0], cb);
			}
		});
	},

	remove: function(fid, server, cb) {
		var ins = this;

		if ((typeof server == "function") && !cb) {
			cb = server;
			server = false;
		}

		if (!server) {
			this.find(function(pub, priv) {
				for (var i in priv) {
					ins.http.del(priv[i], function(err, resp, body) {
						if (err) {
							cb(err, resp, body);
						}
					});
				}
			});
		} else {
			this.http.del(server, cb);
		}
	}
};

module.exports = WeedFSClient;
