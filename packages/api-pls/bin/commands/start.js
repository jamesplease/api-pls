'use strict';

const chalk = require('chalk');

module.exports = function() {
  console.log(chalk.grey('Starting the API webserver...'));
  console.log(chalk.green('The API webserver is listening on localhost:5000'));
};
