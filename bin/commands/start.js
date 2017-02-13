'use strict';

const log = require('../util/log');
const startServer = require('../../lib/start-server');

module.exports = function(options) {
  log.info(`Starting the API webserver on port ${options.port}`);
  startServer(options);
};
