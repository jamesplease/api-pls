'use strict';

const path = require('path');
const chalk = require('chalk');
const log = require('../util/log');

module.exports = function(options) {
  log(
    chalk.grey(`Starting the API webserver on port ${options.port}`),
    options
  );

  const serverPath = path.join(__dirname, '..', '..', 'index.js');
  const server = require(serverPath);
  server(options);
};
