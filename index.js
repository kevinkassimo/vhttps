/*!
 * vhttps
 * Copyright(c) 2018 Kevin Qian
 * MIT Licensed
 */

const {
  Server,
  createServer,
} = require('./lib/vhttps');
const init = require('./lib/init');

module.exports = {
  Server,
  createServer,
  init,
};
