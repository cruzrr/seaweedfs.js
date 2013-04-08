/*
 * node-weedfs: weed-fs client library
 *
 * Written by Aaron Blakely <aaron@cruzrr.com>
 * Maintained at cruzrr.  (http://cruzrr.com)
 *
 */

var weedfs = require("./lib/weedfs");
weedfs.request(require("request"));

module.exports = weedfs;
