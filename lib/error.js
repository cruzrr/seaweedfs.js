"use strict";

var util = require('util');

module.exports = SeaweedFSError;

function SeaweedFSError(message) {
    this.name = 'SeaweedFSError';
    this.message = message || 'Communication with SeaweedFS failed';
    this.stack = (new Error()).stack;
}
SeaweedFSError.prototype = Object.create(Error.prototype);
SeaweedFSError.prototype.constructor = SeaweedFSError;