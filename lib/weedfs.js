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
		this.http(this.baseURL + "/dir/assign", function(err, resp, body) {
			if (!err) {
				cb(JSON.parse(body));
			} else {
				cb(null);
			}
		});
	},

	write: function(file, cb) {
		var ins = this;

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
		var volume = fid[0];

		this.http(this.baseURL + "/dir/lookup?volumeId=" + volume, function(err, resp, body) {
			var jsonresp = JSON.parse(body);
			var publocations = [];
			var srvlocations = [];

			for (var i in jsonresp.locations) {
				for (var j in jsonresp.locations[i]) {
					publocations.push("http://"+j.publicUrl+"/"+fid);
					srvlocations.push("http://"+j.url+"/"+fid);
				}
			}

			cb(publocations, srvlocations);
		});
	},

	read: function(fid, cb) {
		var ins = this;

		this.find(fid, function(pub) {
			return ins.http(pub[0]);
		});
	},

	remove: function(server, fid, cb) {
		var url = "";

		if ((typeof fid == "function") && !cb) {
			cb  = fid;
			url = server;
		} else {
			url = "http://"+server+"/"+fid;
		}
		
		this.http.del(url, cb);
	}
};

module.exports = WeedFSClient;
