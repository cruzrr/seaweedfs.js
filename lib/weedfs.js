/*
 * node-weedfs: weed-fs client library
 *
 * Written by Aaron Blakely <aaron@cruzrr.com>
 * Maintained at cruzrr.  (http://cruzrr.com)
 *
 */

var qs = require('querystring');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var http = require("http");
var url = require("url");
var SeaweedFSError = require("./error");

function WeedFSClient(opts) {
	this.usePublicUrl = opts.usePublicUrl || false;
	this.clientOpts = opts || {};

	this.baseURL = "http://" + this.clientOpts.server + ":" + this.clientOpts.port + "/";
}

WeedFSClient.prototype = {
	_assign: function (opts) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var req = http.request(url.parse(self.baseURL + "dir/assign?" + qs.stringify(opts)), function (res) {
				var tmp = [];
				res.on("readable", function () {
					var chunk;
					while ((chunk = res.read()) !== null) {
						tmp.push(chunk);
					}
				});
				res.on("end", function () {
					var buffer = Buffer.concat(tmp);
					var json = JSON.parse(buffer.toString("utf8"));
					resolve(json);
				});
			});
			req.on("error", function (err) {
				reject(err);
			});
			req.end();
		});
	},

	write: function (file, opts) {
		var self = this;
		return new Promise(function (resolve, reject) {
			opts = opts || {};

			if (file instanceof Array) {
				opts.count = file.length;

				for (var i = 0; i < opts.count; i++) {
					if (typeof file[i] === "string") {
						file[i] = path.resolve(process.cwd(), file[i]);
					}
				}
			} else {
				opts.count = 1
				if (typeof file === "string") {
					file = path.resolve(process.cwd(), file);
				}
				file = [file];
			}

			var ins = this;

			self._assign(opts).then(function (finfo) {
				if (finfo.error) {
					return reject(finfo.error);
				}

				var proms = [];
				for (var i = 0; i < opts.count; i++) {
					proms.push(new Promise(function (resolve, reject) {
						var form = new FormData();
						var url = "http://" + (self.usePublicUrl ? finfo.publicUrl : finfo.url) + "/" + finfo.fid + (opts.count == 1 ? "" : "_" + i);
						var stream = typeof file[i] === "string" ? fs.createReadStream(file[i]) : null;
						form.append("file", stream ? stream : file[i]);
						var req = form.submit(url, function (err, res) {
							if (err) {
								return reject(err);
							}
							resolve(res);
						});

						//we only check for self created streams, stream errors from outside streams should be handled outside
						if (stream) {
							stream.on("error", function (err) {
								reject(err);
							});
						}

						req.on("error", function (err) {
							reject(err);
						});

						req.on("socket", function (socket) {
							socket.on("error", function (err) {
								reject(err);
							});
						})
					}));
				}
				Promise.all(proms).then(function () {
					resolve(finfo);
				}).catch(function (err) {
					reject(err);
				});
			});

		});
	},

	find: function (fid) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var req = http.request(url.parse(self.baseURL + "dir/lookup?volumeId=" + fid), function (res) {
				var tmp = [];
				res.on("readable", function () {
					var chunk;
					while ((chunk = res.read()) !== null) {
						tmp.push(chunk);
					}
				});
				res.on("end", function () {
					var buffer = Buffer.concat(tmp);
					var json = JSON.parse(buffer.toString("utf8"));
					if (json.error) {
						var err = new SeaweedFSError(json.error);
						err.volumeId = json.volumeId;
						reject(err);
					} else {
						resolve(json);
					}
				});
			});
			req.on("error", function (err) {
				reject(err);
			});
			req.end();
		});
	},

	clusterStatus: function () {
		var self = this;
		return new Promise(function (resolve, reject) {
			var req = http.request(url.parse(self.baseURL + "cluster/status"), function (res) {
				var tmp = [];
				res.on("readable", function () {
					var chunk;
					while ((chunk = res.read()) !== null) {
						tmp.push(chunk);
					}
				});
				res.on("end", function () {
					var buffer = Buffer.concat(tmp);
					var json = JSON.parse(buffer.toString("utf8"));
					resolve(json);
				});
			});
			req.on("error", function (err) {
				reject(err);
			});
			req.end();
		});
	},

	masterStatus: function () {
		var self = this;
		return new Promise(function (resolve, reject) {
			var req = http.request(url.parse(self.baseURL + "cluster/status"), function (res) {
				var tmp = [];
				res.on("readable", function () {
					var chunk;
					while ((chunk = res.read()) !== null) {
						tmp.push(chunk);
					}
				});
				res.on("end", function () {
					var buffer = Buffer.concat(tmp);
					var json = JSON.parse(buffer.toString("utf8"));
					resolve(json);
				});
			});
			req.on("error", function (err) {
				reject(err);
			});
			req.end();
		});
	},

	systemStatus: function (cb) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var req = http.request(url.parse(self.baseURL + "dir/status"), function (res) {
				var tmp = [];
				res.on("readable", function () {
					var chunk;
					while ((chunk = res.read()) !== null) {
						tmp.push(chunk);
					}
				});
				res.on("end", function () {
					var buffer = Buffer.concat(tmp);
					var json = JSON.parse(buffer.toString("utf8"));
					resolve(json);
				});
			});
			req.on("error", function (err) {
				reject(err);
			});
			req.end();
		});
	},

	volumeStatus: function (host) {
		return new Promise(function (resolve, reject) {
			var req = http.request(url.parse("http://" + host + "/status"), function (res) {
				var tmp = [];
				res.on("readable", function () {
					var chunk;
					while ((chunk = res.read()) !== null) {
						tmp.push(chunk);
					}
				});
				res.on("end", function () {
					var buffer = Buffer.concat(tmp);
					var json = JSON.parse(buffer.toString("utf8"));
					resolve(json);
				});
			});
			req.on("error", function (err) {
				reject(err);
			});
			req.end();
		});
	},

	read: function (fid, stream) {
		var self = this;

		return new Promise(function (resolve, reject) {
			self.find(fid).then(function (res) {
				if (res.locations.length) {
					var req = http.request(url.parse("http://" + (self.usePublicUrl ? res.locations[0].publicUrl : res.locations[0].url) + "/" + fid), function (res) {
						if (res.statusCode === 404) {
							var err = new SeaweedFSError("file '" + fid + "' not found");
							if (stream) {
								stream.emit("error", err);
							}
							reject(err);
						}
						if (stream) {
							res.pipe(stream);
							resolve(stream);
						} else {
							var tmp = [];
							res.on("readable", function () {
								var chunk;
								while ((chunk = res.read()) !== null) {
									tmp.push(chunk);
								}
							});
							res.on("end", function () {
								var buffer = Buffer.concat(tmp);
								resolve(buffer);
							});
						}
					});
					req.on("error", function (err) {
						if (stream) {
							stream.emit("error", err);
						}
						reject(err);
					});
					req.end();
				} else {
					var err = new SeaweedFSError("No volume servers found for volume " + fid.split(",")[0]);
					if (stream) {
						stream.emit("error", err);
					}
					reject(err);

				}
			});
		});

	},

	remove: function (fid) {
		var self = this;

		return new Promise(function (resolve, reject) {
			self.find(fid).then(function (result) {
				var proms = [];
				for (var i = 0, len = result.locations.length; i < len; i++) {
					proms.push(new Promise(function (resolve, reject) {
						var req = http.request(Object.assign(url.parse("http://" + (self.usePublicUrl ? result.locations[i].publicUrl : result.locations[i].url) + "/" + fid), {
							"method": "DELETE"
						}), function (res) {
							if (res.statusCode === 404) {
								var err = new SeaweedFSError("file '" + fid + "' not found");
								return reject(err);
							}
							var tmp = [];
							res.on("readable", function () {
								var chunk;
								while ((chunk = res.read()) !== null) {
									tmp.push(chunk);
								}
							});
							res.on("end", function () {
								var buffer = Buffer.concat(tmp);
								var payload = JSON.parse(buffer.toString("utf-8"));
								
								if(!payload.size) {
									return reject(new SeaweedFSError("File with fid " + fid + " could not be removed"));
								}
								resolve(payload);
							});
						});
						req.on("error", function (err) {
							reject(err);
						});
						req.end();
					}));
				}
				Promise.all(proms).then(function () {
					resolve({
						count: result.locations.length
					});
				}).catch(function (err) {
					reject(err);
				});
			});
		});
	},

	vacuum: function (opts) {
		var self = this;
		opts = opts || {};
		return new Promise(function (resolve, reject) {
			var req = http.request(url.parse(self.baseURL + "vol/vacuum?" + qs.stringify(opts)), function (res) {
				var tmp = [];
				res.on("readable", function () {
					var chunk;
					while ((chunk = res.read()) !== null) {
						tmp.push(chunk);
					}
				});
				res.on("end", function () {
					var buffer = Buffer.concat(tmp);
					resolve(JSON.parse(buffer.toString("utf8")));
				});
			});
			req.on("error", function (err) {
				reject(err);
			});
			req.end();
		});
	}
};

module.exports = WeedFSClient;