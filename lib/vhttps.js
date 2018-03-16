/*!
 * vhttps
 * Copyright(c) 2018 Kevin Qian
 * MIT Licensed
 */

'use strict';

const crypto = require('crypto');
const tls = require('tls');
const util = require('util');
const {
  Server: HttpServer,
  _connectionListener
} = require('_http_server');
const { inherits } = util;
const { IncomingMessage, ServerResponse } = require('http');
const { kIncomingMessage } = require('_http_common');
const { kServerResponse } = require('_http_server');

/**
 * Create a Node HTTPS like server with multiple credentials added
 * 
 * @param {object} opts
 * @param {Array<object>} creds
 * @param {function} requestListener
 * @return {Server}
 * @public
 */

function Server(opts, creds, requestListener) {
  if (!(this instanceof Server)) return new Server(opts, creds, requestListener);

  if (typeof creds === 'function') {
    requestListener = creds;
    creds = [];
  }

  if (typeof opts === 'function') {
    requestListener = opts;
    opts = undefined;
    creds = [];
  }
  opts = util._extend({}, opts);

  if (process.features.tls_npn && !opts.NPNProtocols) {
    opts.NPNProtocols = ['http/1.1', 'http/1.0'];
  }
  if (process.features.tls_alpn && !opts.ALPNProtocols) {
    opts.ALPNProtocols = ['http/1.1'];
  }

  this[kIncomingMessage] = opts.IncomingMessage || IncomingMessage;
  this[kServerResponse] = opts.ServerResponse || ServerResponse;

  tls.Server.call(this, opts, _connectionListener);

  this.httpAllowHalfOpen = false;

  if (requestListener) {
    this.addListener('request', requestListener);
  }

  this.addListener('tlsClientError', function addListener(err, conn) {
    if (!this.emit('clientError', err, conn))
      conn.destroy(err);
  });

  this.timeout = 2 * 60 * 1000;
  this.keepAliveTimeout = 5000;

  const server = this;
  creds.forEach(function(cred) {
    cred = util._extend({}, cred);
    var hostname = cred.hostname || cred.host;
    if (!hostname) {
      throw new TypeError('hostname is missing for one of the credential objects');
    }
    server.addContext(hostname, cred); 
  });
}

inherits(Server, tls.Server);

Server.prototype.setTimeout = HttpServer.prototype.setTimeout;


/**
 * Function wrapper for creating a Node HTTPS like server with multiple credentials added
 * 
 * @param {object} opts
 * @param {Array<object>} creds
 * @param {function} requestListener
 * @return {Server}
 * @public
 */

function createServer(opts, creds, requestListener) {
  return new Server(opts, creds, requestListener);
}

module.exports = {
  Server,
  createServer,
};
