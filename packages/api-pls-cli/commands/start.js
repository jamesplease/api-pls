'use strict';

const log = require('../util/log');
const startServer = require('../../api-pls-utils/start-server');

module.exports = function(options) {
  log.info(`Starting the API webserver on port ${options.port}`);
  startServer(options);
};
