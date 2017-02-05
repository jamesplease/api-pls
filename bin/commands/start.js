'use strict';

const path = require('path');
const chalk = require('chalk');

module.exports = function(options) {
  console.log(chalk.grey(`Starting the API webserver on port ${options.port}`));
  const serverPath = path.join(__dirname, '..', '..', 'index.js');
  const server = require(serverPath);
  server(options);
};
