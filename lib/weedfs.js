/*
 * node-weedfs: weed-fs client library
 *
 * Written by Aaron Blakely <aaron@cruzrr.com>
 * Maintained at cruzrr.  (http://cruzrr.com)
 *
 */

var qs		= require('querystring');
var fs		= require('fs');
var path	= require('path');
var util  = require('util');

util.isFunction = util.isFunction || function(obj){
  return typeof obj === 'function' || !!(obj && obj.constructor && obj.call && obj.apply);
};

function WeedFSClient(opts) {
	this.http		= opts.client || require("request");
	this.usePublicURLs	= opts.usePublicURLs || false;
	this.clientOpts		= opts || {};

	this.baseURL = "http://"+this.clientOpts.server + ":" + this.clientOpts.port + "/";
}

WeedFSClient.prototype = {
	request: function(client) {
		this.http = client;
	},

	_assign: function(opts, cb) {
		var ins = this;
		this.http(this.baseURL + "dir/assign?"+qs.stringify(opts), function(err, resp, body) {
			if (!err && !body) {
				err = 'Did not receive a valid response.';
			}
			if (!err) {

				var parsedBody = JSON.parse(body);
				if (ins.usePublicURLs == true) {
					parsedBody.url = parsedBody.publicUrl;
				}

				cb(parsedBody);

			} else {

				cb({error: err});

			}
		});
	},

	write: function(file, opts, cb) {
		if (util.isFunction(opts) && !cb) {
			cb = opts;
			opts = {};
		}

    if (file instanceof Buffer) {
			opts.count = 1
		} else if (file instanceof Array) {
			opts.count = file.length;

			for (var i = 0; i < opts.count; i++) {
				if (file[i] instanceof Buffer) continue;
				file[i] = path.resolve(process.cwd(), file[i]);
			}
		} else {
			file = path.resolve(process.cwd(), file);
			opts.count = 1;
		}

		var ins = this;

		this._assign(opts, function(finfo) {
			if (finfo.error) {
				// throw new Error(finfo.error);
				cb(finfo.error, null);
				return;
			}

      var replies = 0;
        if (opts.count == 1) {
          var req = ins.http.post("http://"+finfo.url+"/"+finfo.fid, function(err, resp, body) {
			  if (err) {
				  console.error('file upload error',err);
			  } else {
				  if (resp.statusCode == 200 || resp.statusCode == 201) {
					  replies++;
				  } else {
					  console.error('file upload error',resp.statusCode,body);
				  }
			  }
			  if(replies === opts.count){
				  cb(null, finfo);
			  }else {
				  cb('file upload error', null);
			  }
		  });

          var isStream = typeof file == "string" ? 1 : 0;
          var writeForm = req.form();

          if (isStream) {
            writeForm.append("file", file instanceof Buffer ? file : fs.createReadStream(file));
          } else {
            writeForm.append("file", file);
          }
        }
        else if(opts.count > 1) {
          for (var i = 0; i < opts.count; i++) {
            var req = ins.http.post("http://"+finfo.url+"/"+finfo.fid+"_"+i, function() {
              replies++;
              if (replies === opts.count) cb(null, finfo);
            });

            var isStream = typeof file[i] == "string" ? 1 : 0;
            var writeForm = req.form();

            if (isStream) {
              writeForm.append("file", file[i] instanceof Buffer ? file[i] : fs.createReadStream(file[i]));
            } else {
              writeForm.append("file", file[i]);
            }
          }
        }
        else {
          throw new Error("Only String, Buffers, Streams or an Array of Strings/Buffers/Streams are supported.");
      }
		});
	},

	find: function(fid, cb) {
		var volume = fid.split(/,|\//)[0];

		this.http(this.baseURL + "dir/lookup?volumeId=" + volume, function(err, resp, body) {
			var publocations = [];
			var srvlocations = [];
			if (err) {
				console.error('find volume error', err);
			} else {
				if (resp.statusCode == 200) {
					var jsonresp = JSON.parse(body);
					for (var i in jsonresp.locations) {
						publocations.push("http://" + jsonresp.locations[i].publicUrl + "/" + fid);
						srvlocations.push("http://" + jsonresp.locations[i].url + "/" + fid);
					}
				} else {
					console.warn('find volume error', resp.statusCode, body);
				}
			}
			cb(publocations, srvlocations);
		});
	},

	systemStatus: function(cb) {
		this.http(this.baseURL + "dir/status", function(err, resp, body) {
			if (err) {
				cb(err);
			} else {
				cb(null, JSON.parse(body));
			}
		});
	},

	status: function(server, port, cb) {
		this.http("http://"+server+":"+port+"/status", function(err, resp, body) {
			if (err) {
				cb(err);
			} else {
				cb(null, JSON.parse(body));
			}
		});
	},

	read: function(fid, stream, cb) {
		var ins = this;
		if (util.isFunction(stream) && !cb) {
			cb     = stream;
			stream = false;
		}

		this.find(fid, function(pub) {
			if (pub[0]) {
				if (stream) {
					ins.http(pub[0]).pipe(stream);
				} else {
					ins.http({ method: 'GET', encoding: null, url: pub[0] }, function(err, response, body) {
						if (response.statusCode === 404) {
							cb(new Error("file '"+ fid + "' not found"), null)
						} else {
							cb(err, response, body);
						}
					});
				}
			} else {
				cb(new Error("file '"+ fid + "' not found"), null)
			}
		});
	},

	remove: function(fid, server, cb) {
		var ins = this;

		if (util.isFunction(server) && !cb) {
			cb = server;
			server = false;
		}

		if (server) {
			// Remove HTTP junk from server string
			server = server.replace("http://", "");
			server = server.replace("/", "");
		}

		this.find(fid, function(pub, priv) {
			if (priv.length > 0) {
				for (var i in priv) {
					if (server) {
						if (priv[i] == server) {
							ins.http.del(priv[i], function (err, resp, body) {
								if (err) {
									cb(err, resp, body);
								} else {
									cb(null, resp, body);
								}
							});
						}
					} else {
						ins.http.del(priv[i], function (err, resp, body) {
							if (err) {
								cb(err, resp, body);
							} else {
								cb(null, resp, body);
							}
						});
					}
				}
			}else{
				cb(new Error("file '"+ fid + "' not found"), null, null);
			}
		});
	},

	vacuum: function(opts, cb) {
		if (util.isFunction(opts) && !cb) {
			cb = opts;
			opts = {};
		}

		this.http(this.baseURL + "vol/vacuum?" + qs.stringify(opts), function(err, resp, body) {
			if (err) {
				cb(err);
			} else {
				cb(null, JSON.parse(body));
			}
		});
	}
};

module.exports = WeedFSClient;
