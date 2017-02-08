'use strict';

const chalk = require('chalk');
const log = require('../util/log');
const startServer = require('../../lib/start-server');

module.exports = function(options) {
  log(
    chalk.grey(`Starting the API webserver on port ${options.port}`),
    options
  );

  startServer(options);
};
