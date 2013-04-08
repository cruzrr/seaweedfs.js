/*
 * node-weedfs: weed-fs client library
 *
 * Written by Aaron Blakely <aaron@cruzrr.com>
 * Maintained at cruzrr.  (http://cruzrr.com)
 *
 */

var fs		= require('fs');
var qs		= require('querystring');

function WeedFSClient(opts) {
	this.clientOpts		= opts || {};
	
}
