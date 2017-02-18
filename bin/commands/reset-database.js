'use strict';

const inquirer = require('inquirer');
const log = require('../util/log');
const wipeDatabase = require('../../lib/database/wipe');

function performWipe(options) {
  const db = require('../../lib/database')(options);

  log.info('Resetting the database...');
  log.debug({
    databaseUrl: options.DATABASE_URL,
    ssl: options.ssl
  });

  wipeDatabase(db)
    .then(() => {
      log.success('✔ The database has been reset.');
      process.exit();
    })
    .catch((e) => {
      log.error('There was an error while cleaning up the previous example.');
      log.debug({
        databaseUrl: options.DATABASE_URL,
        ssl: options.ssl
      });
      if (log.level !== 'trace') {
        log.info('Run this command with --verbose to see more information about this error.')
      }

      process.exit(1);
    });
}

module.exports = function(options) {
  inquirer.prompt([{
    type: 'confirm',
    name: 'confirmation',
    message: 'Are you sure? This will completely wipe your database. It cannot be undone.',
    default: false
  }])
    .then((answers) => {
      if (answers.confirmation) {
        performWipe(options);
      }
    });
};
