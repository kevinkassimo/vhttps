const assert = require('assert');
const vhttps = require('..');
// const request = require('supertest');

const tls = require('tls');

describe('vhttps.Server', function() {
  it('should inherit from tls.Server', function() {
    assert(new vhttps.Server({}, [], function() {}) instanceof tls.Server);
  });

  it('should be able to add context', function() {
    const server = new vhttps.Server({}, [{ hostname: 'a.com' }, { hostname: 'b.com' }], function() {});
    assert.equal(server._contexts.length, 2);
  });
});

describe('vhttps.init', function() {
  it('should have no internal server before listening and has server after listening', function() {
    const server = vhttps.init();
    server.setOptions({ ecdhCurve: 'sect571r1' });
    const aHandler = function(req, res) {};
    const dHandler = function(req, res) {};
    server.use('a.com', { dummy: 'dummy' }, aHandler);
    server.use(dHandler);
    assert.equal(server.server, null);
    assert.equal(server.defaultHandler, dHandler);
    setTimeout(function() {
      server.close();
    }, 1000);
    server.listen(8000);
    assert(server.server !== null);
  });
});