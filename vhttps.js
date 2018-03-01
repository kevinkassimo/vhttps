// Copyright Kevin Qian.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// The following implementation is an adaption from Node.js HTTPS module
'use strict';

const crypto = require('crypto');
const tls = require('tls');
const url = require('url');
const util = require('util');
const {
    Server: HttpServer,
    _connectionListener
} =
require('_http_server');
const { ClientRequest } = require('_http_client');
const { inherits } = util;
const { IncomingMessage, ServerResponse } = require('http');
const { kIncomingMessage } = require('_http_common');
const { kServerResponse } = require('_http_server');

// BEGIN: NodeJS implementation of normal HTTPS server
function Server(opts, requestListener) {
    if (!(this instanceof Server)) return new Server(opts, requestListener);

    if (typeof opts === 'function') {
        requestListener = opts;
        opts = undefined;
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

    tls.Server.call(this, opts, _connectionListener); // we can consider modify this _connectionListener!

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
}

inherits(Server, tls.Server);

Server.prototype.setTimeout = HttpServer.prototype.setTimeout;
// END: NodeJS implementation of normal HTTPS server

// BEGIN: Implementation supporting virtual HTTPS servers
function createServer(defaultOpts, multiOpts, requestListener) {
    const newServer = new Server(defaultOpts, requestListener);
    for (const opts of multiOpts) {
        // Imitate newServer._sharedContext setup
        const creds = {
            pfx: opts.pfx || newServer.pfx,
            key: opts.key || newServer.key,
            passphrase: opts.passphrase || newServer.passphrase,
            cert: opts.cert || newServer.cert,
            clientCertEngine: opts.clientCertEngine || newServer.clientCertEngine,
            ca: opts.ca || newServer.ca,
            ciphers: opts.ciphers || newServer.ciphers,
            ecdhCurve: opts.ecdhCurve || newServer.ecdhCurve,
            dhparam: opts.dhparam || newServer.dhparam,
            secureProtocol: opts.secureProtocol || newServer.secureProtocol,
            secureOptions: opts.secureOptions || newServer.secureOptions,
            honorCipherOrder: opts.honorCipherOrder || newServer.honorCipherOrder,
            crl: opts.crl || newServer.crl,
            sessionIdContext: opts.sessionIdContext || 
                crypto.createHash('sha1').update(process.argv.join(' ')).digest('hex').slice(0, 32),
        };
        // Submit context to TLS layer
        newServer.addContext(opts.hostname, creds);
    }
    return newServer;
}
// END: Implementation supporting virtual HTTPS servers

module.exports = {
    Server,
    createServer,
};
