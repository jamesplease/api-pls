'use strict';

const path = require('path');

// Starts the server with `options`
module.exports = function(options) {
  const serverPath = path.join(__dirname, '..', '..', 'server', 'index.js');
  const server = require(serverPath);
  server(options);
};
