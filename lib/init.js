/*!
 * vhttps
 * Copyright(c) 2018 Kevin Qian
 * MIT Licensed
 */

'use strict';

const {
  Server,
  createServer,
} = require('./vhttps');
const extend = require('util')._extend;

/**
 * Create a vhttps server instance
 * 
 * @param {object} opts
 * @return {_Init}
 * @private
 */

function _Init(opts) {
  if (!(this instanceof _Init)) return new _Init(opts);
  this.opts = opts || {};
  this.defaultHandler = function() {};
  this.requestHandlers = [];
  this.server = null;
}

/**
 * Set server options
 * 
 * @param {object} opts
 * @return {_Init}
 * @public
 */

_Init.prototype.setOptions = function(opts) {
  this.opts = opts || this.opts;
  return this;
};

/**
 * Add a certain hostname with credentials and corresponding request handler
 * 
 * @param {string} hostname
 * @param {object} cred
 * @param {Function} handler
 * @return {_Init}
 * @public
 */

_Init.prototype.use = function(hostname, cred, handler) {
  if (typeof hostname === 'function') {
    handler = hostname;
    hostname = null;
  }
  if (!hostname) {
    this.defaultHandler = handler;
  } else {
    this.requestHandlers.push({
      hostname,
      regexp: new RegExp('^' + hostname.replace(/([.^$+?\-\\[\]{}])/g, '\\$1').replace(/\*/g, '[^.]*') +'$'),
      cred,
      handler,
    });
  }
  return this;
}

/**
 * Make vhttps instance listen at given port (default to 443)
 * and returns a normal HTTPS-server like instance
 *
 * @param {number|string} port
 * @return {_Init} 
 * @public
 */

_Init.prototype.listen = function(port) {
  if (this.server) { // server already listening at some port
    return this;
  }

  port = +port || 443;
  const creds = this.requestHandlers.map(function(h) {
    return extend({ hostname: h.hostname }, h.cred);
  });
  const hostHandlers = this.requestHandlers.map(function(h) {
    return {
      regexp: h.regexp,
      handler: h.handler,
    };
  });
  const defaultHandler = this.defaultHandler
  const overallHandler = function(req, res) {
    const currHost = req.headers.host;
    var handled = false;
    for (var i = 0; i < hostHandlers.length; i++) {
      if (hostHandlers[i].regexp.test(currHost)) {
        handled = true;
        hostHandlers[i].handler(req, res);
        break;
      }
    }
    if (!handled) {
      defaultHandler(req, res);
    }
  }
  this.server = createServer(this.opts, creds, overallHandler);
  this.server.listen(port);
  return this;
}

/**
 * Close the server, wrapper of internal server.close
 *
 * @return {_Init} 
 * @public
 */

_Init.prototype.close = function() {
  if (this.server) {
    this.server.close();
  }
}

/**
 * Initialize a vhttp server instance
 *
 * @param {object} opts
 * @public
 */

function init(opts) {
  return new _Init(opts);
}

module.exports = init;
