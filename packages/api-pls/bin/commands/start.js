'use strict';

const path = require('path');
const chalk = require('chalk');

module.exports = function() {
  console.log(chalk.grey('Starting the API webserver...'));

  const serverPath = path.join(__dirname, '..', '..', 'index.js');

  require(serverPath);
};
